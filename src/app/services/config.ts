import * as Promise from 'bluebird';
declare function require(moduleName: string): any;

export default class Config {
  private readonly filename;
  private readonly fs;
  private config: Object;

  constructor(filename: string, fs: Object) {
    this.filename = filename;
    this.fs = fs;
  }

  public initialize(): Promise<Config> {
    return (new Promise((resolve, reject) => {
      this.fs.exists(this.filename, exists => {
        if (exists) return resolve();
        this.fs.writeFile(this.filename, '{}', err => {
          if (err) return reject(err);
          resolve(this);
        });
      });
    }))
    .then(() => Promise.resolve(require(this.filename)))
    .tap(configData => this.config = configData)
    .then(() => this);
  }

  public get(key: string, def?: any): any {
    if (!this.config) {
      throw new ReferenceError('Config is not loaded yet');
    }

    if (typeof this.config[key] === 'undefined') {
      if (typeof def === 'undefined') {
        throw new ReferenceError('Config key ' + key + ' does not exist');
      }
      return def;
    }

    return this.config[key];
  }

  public save(options: Object) {
    this.config = options;
    return this.fs.writeFileAsync(this.filename, JSON.stringify(options, null, 4));
  }

  public serialize() {
    if (!this.config) {
      throw new ReferenceError('Config is not loaded yet');
    }

    return this.config;
  }
}
