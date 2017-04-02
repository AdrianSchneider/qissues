/**
 * Represents an underlying storage system
 * Storage is used for writing config, cache, etc.
 * It's currently assumed to be sync. which should eventually be updated
 */
interface Storage {
  /**
   * Get data from storage
   */
  get(key: string, defaults?: any): Promise<any>;

  /**
   * Write data to storage
   */
  set(key: string, value: any): Promise<void>;

  /**
   * Remove data from storage
   */
  remove(key: string): Promise<void>;

  /**
   * Remove multiple keys from storage
   */
  removeMulti(keys: string[]): Promise<void>;

  /**
   * List all keys in storage
   */
  keys(): Promise<string[]>;

  /**
   * Serialize all storage contents
   */
  serialize(): Promise<Object>;
}

export default Storage;
