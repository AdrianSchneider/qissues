import * as events from 'events';
import * as stream from 'stream';

interface BootstrapParams {
  input: stream.Writable,
  output: stream.Readable,
  configFile: string,
  stateFile: string,
  cacheFile: string,
  logLevel: number,
  clearCache: boolean,
  cachePrefix: string
}

export default BootstrapParams;
