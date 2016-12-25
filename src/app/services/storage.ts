interface Storage {
  get(key: string, defaults?: any): any;
  set(key: string, value: any);
  remove(key: string);
  removeMulti(keys: string[]);
  keys(): string[];
  serialize: Object;
}

export default Storage;
