/**
 * Represents an underlying storage system
 * Storage is used for writing config, cache, etc.
 * It's currently assumed to be sync. which should eventually be updated
 */
interface Storage {
  /**
   * Get data from storage
   */
  get(key: string, defaults?: any): any;

  /**
   * Write data to storage
   */
  set(key: string, value: any);

  /**
   * Remove data from storage
   */
  remove(key: string);

  /**
   * Remove multiple keys from storage
   */
  removeMulti(keys: string[]);

  /**
   * List all keys in storage
   */
  keys(): string[];

  /**
   * Serialize all storage contents
   */
  serialize: Object;
}

export default Storage;
