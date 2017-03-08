/**
 * Describes interface for storing temporary cache data
 */
interface Cache {

  /**
   * Sets a new cache entry
   * Returns the data to allow chaining this with promises easily
   */
  set<T>(key: string, data: T, ttl?: number): Promise<T>;

  /**
   * Attempts to get key from cache, otherwise runs F to get the data
   * and sets it on the way out
   */
  wrap<T>(key: string, f: () => Promise<T>, invalidate?: boolean): Promise<T>;

  /**
   * Gets a key from cache
   */
  get(key: string, invalidate?: boolean): Promise<any>;

  /**
   * Invalidates a cache key
   */
  invalidate(key: string): Promise<void>;

  /**
   * Invalidates all cache keys matching a predicate
   */
  invalidateAll(predicate?: (key: string) => Boolean): Promise<void>;
}

export default Cache;
