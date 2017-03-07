import * as fs         from 'fs';
import Config          from '../services/config';
import Storage         from '../services/storage/disk';
import Container       from '../services/container';
import Cache           from '../../system/cache/storage';
import WinstonLogger   from '../../system/logger/winston';
import BootstrapParams from './../config/bootstrap';
import CacheProxy      from '../../util/proxy/cache';
import RetryProxy      from '../../util/proxy/retry';

export default function buildCore(container: Container, options: BootstrapParams) {
  container.registerService(
    'logger',
    () => WinstonLogger(options.logLevel)
  );

  container.registerService(
    'config',
    () => (new Config(options.configFile, fs)).initialize()
  );

  container.registerService(
    'storage',
    () => new Storage(options.stateFile)
  );

  container.registerService(
    'cache.storage',
    () => new Storage(options.cacheFile)
  );

  container.registerService(
    'cache',
    (storage: Storage) => {
      const cache = new Cache(storage, options.cachePrefix);
      if (options.clearCache) cache.invalidateAll();
      return cache;
    },
    ['cache.storage']
  );

  container.registerService(
    'proxy.retry',
    () => new RetryProxy()
  );

  container.registerService(
    'proxy.cache',
    (cache: Cache) => new CacheProxy(cache),
    ['cache']
  );

  container.registerBehaviour(
    'cachable',
    (service: any, opts: Object, cacheProxy) => cacheProxy.createProxy(service, opts),
    ['proxy.cache']
  );

  container.registerBehaviour(
    'retryable',
    (service: any, opts: Object, retryProxy) => retryProxy.createProxy(service, opts),
    ['proxy.retry']
  );

  return container;
};
