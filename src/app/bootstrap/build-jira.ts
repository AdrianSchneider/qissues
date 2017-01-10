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
import MetadataCacheProxy     from '../../domain/backend/metadataCacheProxy';
import HttpClient             from '../../domain/shared/httpClient';
import CacheProxy from '../../util/proxy/cache';

export default function buildJira(container: Container, config: BootstrapParams): Container {
  container.registerService(
    'tracker.jira.client',
    (config, logger) => jiraClient(config, logger),
    ['config', 'logger']
  );

  container.registerService(
    'tracker.jira.metadata',
    (client: HttpClient) => new JiraMetadata(client),
    ['tracker.jira.client']
  );

  container.registerService(
    'tracker.jira.metadata-cached',
    (metadata: JiraMetadata, cache: Cache) => (new MetadataCacheProxy(cache)).createProxy(metadata),
    ['tracker.jira.metadata', 'cache']
  );

  container.registerService(
    'proxy.cache',
    (cache: Cache) => new CacheProxy(cache),
    ['cache']
  );

  container.registerService(
    'tracker.jira.metadata-cached',
    (metadata: JiraMetadata, proxy: CacheProxy) => {
      const methodsToCacheKeys = {
        getTypes: ['types', Type.unserialize],
        getUsers: ['users', User.unserialize],
        getSprints: ['sprints', Sprint.unserialize],
        getLabels: ['labels', Label.unserialize],
        getProjects: ['projects', Project.unserialize]
      };

      return proxy.createProxy(metadata, {
        predicate: key => typeof methodsToCacheKeys[key] !== 'undefined',
        cacheKey: key => methodsToCacheKeys[key][0],
        serializer: data => data.map(row => row.serialize ? row.serialize() : row),
        unserializer: data => data.map(methodsToCacheKeys[key][1])
      });
    },
    ['tracker.jira.metadata', 'proxy.cache']
  );

  container.registerService(
    'tracker.jira.normalizer',
    (metadata: JiraMetadata, config: Config) => {
      const normalizer = new JiraNormalizer(metadata, config, issueExpectations);
      return normalizer;
    },
    ['tracker.jira.metadata-cached', 'config']
  );

  container.registerService(
    'tracker.jira.repository',
    (client, cache, normalizer, metadata, logger) => new JiraRepository(client, cache, normalizer, metadata, logger),
    ['tracker.jira.client', 'cache', 'tracker.jira.normalizer', 'tracker.jira.metadata-cached', 'logger'],
  );

  container.registerService(
    'tracker.jira',
    (normalizer, repository, metadata) => new IssueTracker(normalizer, repository, metadata, configExpectations),
    ['tracker.jira.normalizer', 'tracker.jira.repository', 'tracker.jira.metadata-cached']
  );

  container.registerService('tracker', tracker => tracker, ['tracker.jira']);
  return container;
}
