import * as Promise from 'bluebird';
import Cache from '../../app/services/cache';

interface ProxyConfiguration {
  predicate: (key: string) => boolean;
  cacheKey: (method: string, args: any[]) => string;
  serializer?: (any) => any;
  unserializer?: (any) => any;
  ttl?: number;
}

/**
 * Responsible for proxying metadata classes and
 * wrapping them with cache handling
 */
export default class CacheProxy {
  private readonly cache: Cache;
  private readonly defaultTtl: number;

  constructor(cache: Cache, defaultTtl: number = 86400) {
    this.cache = cache;
    this.defaultTtl = defaultTtl;
  }

  /**
   * Creates an object proxy that will intercept a tracker medata
   * and cache the results
   */
  public createProxy<T>(target: T, config: ProxyConfiguration): T {
    return new Proxy(target, { get: this.getHandler(config).bind(this) });
  }

  /**
   * Gets the property get handler
   */
  private getHandler(config: ProxyConfiguration): (...args: any[]) => Promise<any> {
    return (target: Object, method: string) => {
      if (!config.predicate(method)) return target[method];

      return (...args): Promise<any> => {
        const ttl          = config.ttl || this.defaultTtl;
        const cacheKey     = config.cacheKey(method, args)
        const serializer   = config.serializer || (data => data);
        const unserializer = config.unserializer || (data => data);

        const cached = this.cache.get(cacheKey);
        if (cached) return Promise.resolve(cached.map(unserializer));

        return target[method].apply(target, args)
          .then(this.cacheResultsAs(cacheKey, serializer, ttl));
      };
    };
  }

  /**
   * Returns a thenable that caches the serialized result
   */
  private cacheResultsAs<T>(name: string, serializer: (data: T) => any, ttl: number): (data: T) => Promise<T> {
    return result => this.cache.set(
      name,
      serializer(result),
      ttl
    ).then(() => result);
  }
}
