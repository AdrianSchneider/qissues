import * as _  from 'underscore';
import Storage from '../storage';

export default class MemoryStorage implements Storage {
  protected readonly data: Object;

  constructor(data: Object) {
    this.data = data || {};
  }

  public get(key: string, defaults: any): any {
    setTimeout(this.cleanup, 1000);
    return this.data[key] || defaults;
  }

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

  public remove(key: string) {
    delete this.data[key];
    this.flush();
  }

  public keys(): string[] {
    return Object.keys(this.data);
  }

  public serialize(): Object {
    return this.data;
  }

  protected cleanup() {
    const now = new Date();
    let changes = false;
    _.each(this.data, function(value, key) {
      if(typeof value.expires !== 'undefined') {
        if(now > new Date(value.expires)) {
          delete this.data[key];
          changes = true;
        }
      }
    });
  }

  protected flush() {

  }

}
