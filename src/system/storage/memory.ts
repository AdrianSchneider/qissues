import Storage from '../../app/services/storage';

export default class MemoryStorage implements Storage {
  protected readonly data: Object;

  constructor(data?: Object) {
    this.data = data || {};
  }

  /**
   * Gets the key from memory
   */
  public get(key: string, defaults?: any): Promise<any> {
    return Promise.resolve(
      typeof this.data[key] !== 'undefined' ? this.data[key] : defaults
    );
  }

  /**
   * Sets the key in memory and flush (for child classes)
   */
  public set(key: string, value: any): Promise<void> {
    if(value === null || typeof value === 'undefined') {
      delete this.data[key];
    } else {
      this.data[key] = value;
    }

    return this.flush();
  }

  public removeMulti(keys: string[]): Promise<void> {
    keys.forEach(key => delete this.data[key]);
    if (keys.length) return this.flush();
    return Promise.resolve();
  }

  /**
   * Removes all keys matching a predicate
   */
  public async removeMatching(predicate: (key: string) => boolean): Promise<void> {
    let keys = await this.keys();
    return this.removeMulti(keys.filter(predicate));
  }

  /**
   * Deletes the key from memory and flush
   */
  public remove(key: string): Promise<void> {
    delete this.data[key];
    return this.flush();
  }

  /**
   * Lists all keys defined in memory
   */
  public keys(): Promise<string[]> {
    return Promise.resolve(Object.keys(this.data));
  }

  /**
   * Serializes all of the state
   */
  public serialize(): Promise<Object> {
    return Promise.resolve({ ...this.data });
  }

  /**
   * Purges any keys that have expired, and flush if any are removed
   */
  protected cleanup(): Promise<void> {
    const now = new Date();
    let changes = false;

    Object.keys(this.data)
      .map(key => [key, this.data[key]])
      .filter(([key, value]) => value && value.expires && now > new Date(value.expires) )
      .forEach(([key, value]) => {
        delete this.data[key];
        changes = true;
      });

    if (changes) return this.flush();
    return Promise.resolve();
  }

  /**
   * Child classes should extend this for async storage
   */
  protected flush(): Promise<void> {
    return Promise.resolve();
  }

}
