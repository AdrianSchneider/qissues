import * as events from 'events';

interface BootstrapParams {
  input: events.EventEmitter,
  output: events.EventEmitter,
  configFile: string,
  cacheFile: string,
  logLevel: number,
  clearCache: boolean,
  cachePrefix: string
}

export default BootstrapParams;
