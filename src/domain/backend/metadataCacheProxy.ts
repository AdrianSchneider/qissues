import TrackerMetadata from '../model/trackerMetadata';
import Type            from '../model/meta/user';
import User            from '../model/meta/user';
import Sprint          from '../model/meta/sprint';
import Label           from '../model/meta/label';
import Project         from '../model/meta/project';
import Cache           from '../../app/services/cache';

/**
 * Responsible for proxying metadata classes and
 * wrapping them with cache handling
 */
export default class MetadataCacheProxy {
  private readonly cache: Cache;
  private readonly ttl: number;
  private readonly methodsToCacheKeys = {
    getTypes: ['types', Type.unserialize],
    getUsers: ['users', User.unserialize],
    getSprints: ['sprints', Sprint.unserialize],
    getLabels: ['labels', Label.unserialize],
    getProjects: ['projects', Project.unserialize]
  };

  constructor(cache: Cache, ttl?: number) {
    this.cache = cache;
    this.ttl = ttl || 86400;
  }

  /**
   * Creates an object proxy that will intercept a tracker medata
   * and cache the results
   */
  public createProxy(target: TrackerMetadata): TrackerMetadata {
    return new Proxy(target, { get: this.getHandler.bind(this) });
  }

  /**
   * Returns the get property handler
   */
  private getHandler(target: TrackerMetadata, method: string) {
    if (!this.isInterceptable(method)) return target[method];

    return (...args) => {
      const [cacheKey, unserializer] = this.methodsToCacheKeys[method];
      const cached = this.cache.get(cacheKey);
      if (cached) return Promise.resolve(cached.map(unserializer));

      return target[method].apply(target, args)
        .then(this.cacheResultsAs(cacheKey));
    };
  }

  /**
   * Checks to see if a method is interceptable
   */
  private isInterceptable(method: string): boolean {
    return typeof this.methodsToCacheKeys[method] !== 'undefined';
  }

  /**
   * Returns a thenable that caches the serialized result
   */
  private cacheResultsAs(name: string): (result) => void {
    return result => this.cache.set(
      name,
      result.map(result => result.serialize ? result.serialize() : result),
      this.ttl
    );
  }
}
