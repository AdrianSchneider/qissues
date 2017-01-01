import * as _  from 'underscore';
import Storage from '../storage';

export default class MemoryStorage implements Storage {
  protected readonly data: Object;

  constructor(data?: Object) {
    this.data = data || {};
  }

  /**
   * Gets the key from memory
   */
  public get(key: string, defaults?: any): any {
    setTimeout(this.cleanup, 1000);
    return typeof this.data[key] !== 'undefined' ? this.data[key] : defaults;
  }

  /**
   * Sets the key in memory and flush (for child classes)
   */
  public set(key: string, value: any) {
    if(value === null || typeof value === 'undefined') {
      delete this.data[key];
    } else {
      this.data[key] = value;
    }
    this.flush();
  }

  public removeMulti(keys: string[]) {
    keys.forEach(key => delete this.data[key]);
    if (keys.length) this.flush();
  }

  /**
   * Deletes the key from memory and flush
   */
  public remove(key: string) {
    delete this.data[key];
    this.flush();
  }

  /**
   * Lists all keys defined in memory
   */
  public keys(): string[] {
    return Object.keys(this.data);
  }

  public serialize(): Object {
    return { ...this.data };
  }

  /**
   * Purges any keys that have expired, and flush if any are removed
   */
  protected cleanup() {
    const now = new Date();
    let changes = false;

    Object.keys(this.data)
      .map(key => [key, this.data[key]])
      .filter(([key, value]) => value && value.expires && now > new Date(value.expires) )
      .forEach(([key, value]) => {
        delete this.data[key];
        changes = true;
      });

    if (changes) this.flush();
  }

  protected flush() { }

}
