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
  serializer?: (data: any, method: string, args: any[]) => any;

  /**
   * Optional unserializer (cached representation -> response)
   */
  unserializer?: (data: any, method: string, args: any[]) => any;

  /**
   * Function to check whether or not to invalidate cache
   */
  invalidator?: (method: string, args: any[]) => boolean;

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
    return new Proxy(<any>target, { get: this.getHandler(config).bind(this) });
  }

  /**
   * Gets the property get handler
   */
  private getHandler(config: ProxyConfiguration): (...args: any[]) => Promise<any> {
    return (target: Object, method: string) => {
      if (!config.predicate(method)) return target[method];

      return async (...args): Promise<any> => {
        const ttl          = config.ttl || this.defaultTtl;
        const cacheKey     = config.cacheKey(method, args)
        const serializer   = config.serializer || ((data, method, args) => data);
        const unserializer = config.unserializer || ((data, key: string, args) => data);
        const invalidator  = config.invalidator || (() => false);

        const cached = await this.cache.get(cacheKey, invalidator(method, args));
        if (cached) return unserializer(cached, method, args);

        const result = await target[method].apply(target, args);
        await this.cacheResultsAs(cacheKey, serializer, ttl, method, args)(result);
        return result;
      };
    };
  }

  /**
   * Returns a thenable that caches the serialized result
   * before returning it
   */
  private cacheResultsAs<T>(
    name: string, 
    serializer: (data: T, method, args) => any, 
    ttl: number, 
    method, 
    args
  ): (data: T) => Promise<void> {
    return async result => await this.cache.set(name, serializer(result, method, args), ttl);
  }
}
