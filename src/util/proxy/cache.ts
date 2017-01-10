import * as Promise from 'bluebird';
import Cache from '../../app/services/cache';

interface ProxyConfiguration {
  /**
   * Test to see if a key is cacheable
   */
  predicate: (key: string) => boolean;

  /**
   * Function to generate cache key for given method/args
   */
  cacheKey: (method: string, args: any[]) => string;

  /**
   * Optional serializer (data to cache -> cached representation)
   */
  serializer?: (any) => any;

  /**
   * Optional unserializer (cached representation -> response)
   */
  unserializer?: (data: any, key: string) => any;

  /**
   * Optional ttl to set on item (overriding proxy default)
   */
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
        const unserializer = config.unserializer || ((data, key: string) => data);

        const cached = this.cache.get(cacheKey);
        if (cached) return Promise.resolve(cached.map(unserializer));

        return target[method].apply(target, args)
          .then(this.cacheResultsAs(cacheKey, serializer, ttl));
      };
    };
  }

  /**
   * Returns a thenable that caches the serialized result
   * before returning it
   */
  private cacheResultsAs<T>(name: string, serializer: (data: T) => any, ttl: number): (data: T) => Promise<T> {
    return result => Promise.resolve(this.cache.set(
      name,
      serializer(result),
      ttl
    )).then(() => result);
  }
}