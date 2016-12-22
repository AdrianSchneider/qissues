import * as fs      from 'fs';
import * as Config  from '../services/config';
import * as Cache   from '../services/cache';
import * as Storage from '../services/storage/disk';
import * as logger  from '../services/logger';

interface Options {
  configFile: string,
  logLevel: "debug" | "warn" | "info" | "error",
  cacheFile: string,
  clearCache: boolean
}

export default function buildCore(container, options: Options) {
  container.registerService(
    'logger',
    () => logger(options.logLevel)
  );

  container.registerService(
    'config',
    () => {
      const conf = new Config(options.configFile, fs);
      return conf.initialize().then(() => conf);
    }
  );

  container.registerService(
    'storage',
    () => new Storage(options.cacheFile)
  );

  container.registerService(
    'cache',
    (storage: Storage) => new Cache(storage, options.clearCache, null),
    ['storage']
  );
};
