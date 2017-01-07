import * as Promise   from 'bluebird';
import { createHash } from 'crypto';
import * as moment    from 'moment';
import Storage        from '../services/storage';

interface CacheEntry {
  data: any,
  expires: Date
}

export default class Cache {
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
  public set<T>(key: string, data: T, ttl?: number): T {
    this.storage.set(this.storageKey(key), {
      data: data,
      expires: moment().add(ttl || 3600, 'seconds').toDate()
    });

    return data;
  }

  /**
   * Attempts to get key from cache, otherwise runs F to get the data
   * and sets it on the way out
   */
  public wrap<T>(key: string, f: () => Promise<T>, invalidate?: boolean): Promise<T> {
    const cached = this.get(key, invalidate);
    if (cached) return Promise.resolve(cached);
    return f().then(result => this.set(key, cached));
  }

  /**
   * Gets a key from cache
   */
  public get(key: string, invalidate?: boolean): any {
    if (invalidate) return;
    const entry = this.storage.get(this.storageKey(key));
    if (!entry || this.hasExpired(entry)) return;
    return entry.data;
  }

  public invalidate(key: string) {
    this.remove(key);
  }

  public invalidateAll(predicate?: (key: string) => Boolean) {
    if (!predicate) predicate = () => true;

    this.storage.removeMulti(
      this.storage.keys()
        .filter(item => item.indexOf(this.prefix) === 0)
        .filter(item => predicate(item.substr(this.prefix.length)))
    );
  }

  public clean() {
    this.storage.removeMulti(
      this.storage.keys()
        .filter(key => key.indexOf(this.prefix) === 0)
        .map(key => ({ key: key, entry: this.storage.get(key) }))
        .filter(row => this.hasExpired(row.entry))
        .map(row => row.key)
    );
  }

  private remove(key) {
    this.storage.remove(this.storageKey(key));
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
