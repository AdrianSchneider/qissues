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
import IssueTracker           from '../../domain/model/tracker';
import User                   from '../../domain/model/meta/user';
import Type                   from '../../domain/model/meta/type';
import Label                  from '../../domain/model/meta/label';
import Sprint                 from '../../domain/model/meta/sprint';
import Project                from '../../domain/model/meta/project';
import HttpClient             from '../../domain/shared/httpClient';

export default function buildJira(container: Container, config: BootstrapParams): Container {
  container.registerService(
    'tracker.jira.client',
    (config, logger) => jiraClient(config, logger),
    ['config', 'logger'],
    <any>{
      retryable: {
        backoff: attempt => Math.pow(2, attempt) * 1000
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
          getTypes: ['types', Type.unserialize],
          getUsers: ['users', User.unserialize],
          getSprints: ['sprints', Sprint.unserialize],
          getLabels: ['labels', Label.unserialize],
          getProjects: ['projects', Project.unserialize]
        };

        return {
          predicate: key => typeof methodsToCacheKeys[key] !== 'undefined',
          cacheKey: key => methodsToCacheKeys[key][0],
          serializer: data => data.map(row => row.serialize ? row.serialize() : row),
          unserializer: (data, key) => data.map(methodsToCacheKeys[key][1])
        };
      })()
    }
  );

  container.registerService(
    'tracker.jira.normalizer',
    (metadata: JiraMetadata, config: Config) => {
      const normalizer = new JiraNormalizer(metadata, config, issueExpectations);
      return normalizer;
    },
    ['tracker.jira.metadata', 'config']
  );

  container.registerService(
    'tracker.jira.repository',
    (client, cache, normalizer, metadata, logger) => new JiraRepository(client, cache, normalizer, metadata, logger),
    ['tracker.jira.client', 'cache', 'tracker.jira.normalizer', 'tracker.jira.metadata', 'logger'],
  );

  container.registerService(
    'tracker.jira',
    (normalizer, repository, metadata) => new IssueTracker(normalizer, repository, metadata, configExpectations),
    ['tracker.jira.normalizer', 'tracker.jira.repository', 'tracker.jira.metadata']
  );

  container.registerService('tracker', tracker => tracker, ['tracker.jira']);
  return container;
}
