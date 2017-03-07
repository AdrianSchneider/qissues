import * as Promise   from 'bluebird';
import * as moment    from 'moment';
import Cache          from '../../app/services/cache';

class MemoryCache implements Cache {

  private readonly memory: Object = {};

  /**
   * Sets a new cache entry
   * Returns the data to allow chaining this with promises easily
   */
  public set<T>(key: string, data: T, ttl?: number): Promise<T> {
    const entry: CacheEntry = {
      data: data,
      key: key,
      expires: moment().add(ttl || 3600, 'seconds').toDate()
    };

    this.memory[key] = entry;
    return Promise.resolve(data);
  }

  /**
   * Attempts to get key from cache, otherwise runs F to get the data
   * and sets it on the way out
   */
  public wrap<T>(key: string, f: () => Promise<T>, invalidate?: boolean): Promise<T> {
    return this.get(key, invalidate).then(cached => {
      if (cached) return cached;
      return f().then(result => this.set(key, result));
    });
  }

  /**
   * Gets a key from cache
   */
  public get(key: string, invalidate?: boolean): Promise<any> {
    if (invalidate) return Promise.resolve();

    const entry = this.memory[key];
    if (!entry || this.hasExpired(entry)) return Promise.resolve();
    return Promise.resolve(entry.data);
  }

  public invalidate(key: string): Promise<void> {
    delete this.memory[key];
    return Promise.resolve();
  }

  public invalidateAll(predicate?: (key: string) => Boolean) {
    if (!predicate) predicate = () => true;

    Object.keys(this.memory)
      .filter(predicate)
      .forEach(key => {
        delete this.memory[key];
      });

    return Promise.resolve();
  }

  public clean() {
    Object.keys(this.memory)
      .map(key => ({ key: key, entry: this.memory[key] }))
      .filter(row => this.hasExpired(row.entry))
      .map(row => row.key);

    return Promise.resolve();
  }

  private remove(key) {
    delete this.memory[key];
    return Promise.resolve();
  }

  private hasExpired(entry: CacheEntry): Boolean {
    return new Date(entry.expires) < new Date();
  }

}

interface CacheEntry {
  data: any,
  key: string,
  expires: Date
}

export default MemoryCache;
