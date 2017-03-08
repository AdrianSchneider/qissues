import { createHash } from 'crypto';
import * as moment    from 'moment';
import Storage        from '../../app/services/storage';
import Cache          from '../../app/services/cache';

class StorageCache implements Cache {
  private storage: Storage;
  private prefix: string;
  private hasher: (key: string) => string;

  constructor(storage: Storage, prefix?: string, hasher?: (key: string) => string) {
    this.storage = storage;
    this.prefix = prefix || '';
    this.hasher = hasher || this.md5;
  }

  /**
   * Sets a new cache entry
   * Returns the data to allow chaining this with promises easily
   */
  public async set<T>(key: string, data: T, ttl?: number): Promise<T> {
    const entry: CacheEntry = {
      data: data,
      key: key,
      expires: moment().add(ttl || 3600, 'seconds').toDate()
    };

    await this.storage.set(this.storageKey(key), entry);
    return data;
  }

  /**
   * Attempts to get key from cache, otherwise runs F to get the data
   * and sets it on the way out
   */
  public async wrap<T>(key: string, f: () => Promise<T>, invalidate?: boolean): Promise<T> {
    let cached = await this.get(key, invalidate);
    if (cached) return cached;

    let result = await f();
    await this.set(key, result);
    return result;
  }

  /**
   * Gets a key from cache
   */
  public async get(key: string, invalidate?: boolean): Promise<any> {
    if (invalidate) return Promise.resolve();
    let entry: CacheEntry = await this.storage.get(this.storageKey(key));
    if (entry && !this.hasExpired(entry)) return entry.data;
  }

  public invalidate(key: string): Promise<void> {
    return this.remove(key);
  }

  public async invalidateAll(predicate?: (key: string) => Boolean): Promise<void> {
    if (!predicate) predicate = () => true;

    let keys = await this.storage.keys();
    return this.storage.removeMulti(
      keys
        .filter(item => item.indexOf(this.prefix) === 0)
        .filter(item => predicate(item.substr(this.prefix.length)))
    );
  }

  public clean() {
    return Promise.resolve();
    // return this.storage.keys().then(keys => {
    //   .filter(key => key.indexOf(this.prefix) === 0)
    //   .map(key => ({ key: key, entry: this.storage.get(key) }))
    //   .filter(row => this.hasExpired(row.entry))
    //   .map(row => row.key)
    // });

    // this.storage.removeMulti(
    //   this.storage.keys()
    // );

    // return Promise.resolve();
  }

  private remove(key): Promise<void> {
    return this.storage.remove(this.storageKey(key));
  }

  private hasExpired(entry: CacheEntry): Boolean {
    return new Date(entry.expires) < new Date();
  }

  private storageKey(key: string): string {
    return this.prefix + this.hasher(key);
  }

  private md5(str: string): string {
    return createHash('md5').update(str).digest('hex');
  }
}

interface CacheEntry {
  data: any,
  key: string,
  expires: Date
}

export default StorageCache;
