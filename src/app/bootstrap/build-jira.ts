import Cache                  from '../services/cache';
import Config                 from '../services/config';
import Container              from '../services/container';
import BootstrapParams        from '../config/bootstrap';
import jiraClient             from '../../domain/backend/jira/client';
import JiraMetadata           from '../../domain/backend/jira/metadata';
import JiraRepository         from '../../domain/backend/jira/repository';
import * as issueExpectations from '../../domain/backend/jira/requirements/issue';
import configExpectations     from '../../domain/backend/jira/requirements/config';
import JiraNormalizer         from '../../domain/backend/jira/normalizer';
import Issue                  from '../../domain/model/issue';
import IssuesCollection       from '../../domain/model/issues';
import CommentsCollection     from '../../domain/model/comments';
import IssueTracker           from '../../domain/model/tracker';
import MetadataMatcher        from '../../domain/model/metadataMatcher';
import User                   from '../../domain/model/meta/user';
import Type                   from '../../domain/model/meta/type';
import Label                  from '../../domain/model/meta/label';
import Sprint                 from '../../domain/model/meta/sprint';
import Status                 from '../../domain/model/meta/status';
import Project                from '../../domain/model/meta/project';
import HttpClient             from '../../domain/shared/httpClient';

export default function buildJira(container: Container, config: BootstrapParams): Container {
  container.registerService(
    'tracker.jira.client',
    (config, logger) => jiraClient(config, logger),
    ['config', 'logger'],
    <any>{
      retryable: {
        backoff: attempt => Math.pow(2, attempt) * 1000,
        errorPredicate: e => {
          const ignore = ['status code 400', 'status code 403'];
          const retry = !ignore.some(message => e.stack.indexOf(message) !== -1);
          return retry;
        }
      }
    }
  );

  container.registerService(
    'tracker.jira.metadata',
    (client: HttpClient) => new JiraMetadata(client),
    ['tracker.jira.client'],
    <any>{
      cachable: (() => {
        const methodsToCacheKeys = {
          getTypes: ['metadata.types', Type.unserialize],
          getUsers: ['metadata.users', User.unserialize],
          getSprints: ['metadata.sprints', Sprint.unserialize],
          getLabels: ['metadata.labels', Label.unserialize],
          getStatuses: ['metadata.statuses', Status.unserialize],
          getProjects: ['metadata.projects', Project.unserialize]
        };

        return {
          predicate: key => typeof methodsToCacheKeys[key] !== 'undefined',
          cacheKey: key => methodsToCacheKeys[key][0],
          serializer: data => data.map(row => row.serialize ? row.serialize() : row),
          unserializer: (data, key) => data.map(methodsToCacheKeys[key][1]),
          invalidator: (method, args) => {
            const [options] = args;
            return options && !!options.invalidate;
          }
        };
      })()
    }
  );

  container.registerService(
    'tracker.jira.metadata-matcher',
    metadata => new MetadataMatcher(metadata),
    ['tracker.jira.metadata']
  );

  container.registerService(
    'tracker.jira.normalizer',
    (metadata: JiraMetadata, matcher, config: Config) => {
      const normalizer = new JiraNormalizer(metadata, matcher, config, issueExpectations);
      return normalizer;
    },
    ['tracker.jira.metadata', 'tracker.jira.metadata-matcher', 'config']
  );

  container.registerService(
    'tracker.jira.repository',
    (client, cache, normalizer, metadata, logger) => new JiraRepository(client, cache, normalizer, metadata, logger),
    ['tracker.jira.client', 'cache', 'tracker.jira.normalizer', 'tracker.jira.metadata', 'logger'],
    <any>{
      cachable: {
        predicate: key => ['lookup', 'query', 'getComments'].indexOf(key) !== -1,
        cacheKey: (method, args) => {
          if (method === 'lookup') {
            const [id] = args;
            return `lookup:${id}}`;
          }

          if (method === 'query') {
            const [report] = args;
            return `issues:${report.filters.serialize().toString()}`;
          }
          if (method === 'getComments') {
            const [id] = args;
            return `comments:${id}`;
          }

          throw new Error('Unknown method to cache');
        },
        invalidator: (method, args) => {
          const [input, options] = args;
          return !!options.invalidate;
        },
        serializer: (data, method, args) => {
          return data.serialize ? data.serialize() : data;
        },
        unserializer: (data, method, args) => {
          if (method === 'lookup') return Issue.unserialize(data);
          if (method === 'query')  return IssuesCollection.unserialize(data);
          if (method === 'getComments') return CommentsCollection.unserialize(data);
          throw new Error('Unknown method to serialize: ' + method);
        }
      }
    }
  );

  container.registerService(
    'tracker.jira',
    (normalizer, repository, metadata) => new IssueTracker(normalizer, repository, metadata, configExpectations),
    ['tracker.jira.normalizer', 'tracker.jira.repository', 'tracker.jira.metadata']
  );

  container.registerService('tracker', tracker => tracker, ['tracker.jira']);
  return container;
}
