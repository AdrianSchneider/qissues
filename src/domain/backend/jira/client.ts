import * as _          from 'underscore';
import * as Promise    from 'bluebird';
import * as request    from 'request';
import ValidationError from '../../errors/validation';

interface QueryOptions {

}

export default class JiraHttpClient {

  private logger;
  private config;

  constructor(logger, config) {
    this.logger = logger;
    this.config = config;
  }

  public get(path: string, options?: QueryOptions) {
    this.logger.trace('http request: GET ' + this.buildUrl(path));

    return new Promise((resolve, reject) => {
      request.get(this.buildUrl(path), this.attachOptions(options), (err, res, body) => {
        if(err) return reject(err);
        if(res.statusCode !== 200) {
          this.logger.trace('received ' + JSON.stringify(body, null, 4));
          return reject(new Error('Received ' + res.statusCode + ' instead of 200 (url = ' + path + ')'));
        }
        return resolve(body);
      });
    });
  }

  public post(path, data) {
    this.logger.trace('http request: POST ' + this.buildUrl(path));

    return new Promise((resolve, reject) => {
      var opts = this.attachOptions();
      opts.json = data;
      request.post(this.buildUrl(path), opts, (err, res, body) => {
        if(err) return reject(err);
        if(res.statusCode === 400) {
          return reject(new ValidationError(JSON.stringify(body)));
        }
        return resolve(body);
      });
    });
  }

  public put(path: string, data: Object) {
    this.logger.trace('http request: PUT ' + this.buildUrl(path));

    return new Promise((resolve, reject) => {
      var opts = this.attachOptions();
      opts.json = data;
      request.put(this.buildUrl(path), opts, (err, res, body) => {
        if(err) return reject(err);
        this.logger.trace('http response ' + res.statusCode);
        this.logger.trace('http payload ' + JSON.stringify(body, null, 4));
        return resolve(body);
      });
    });
  }

  public del(path) {
    this.logger.trace('http request: DELETE ' + this.buildUrl(path));

    return new Promise((resolve, reject) => {
      var opts = this.attachOptions();
      request.del(this.buildUrl(path), (err, res, body) => {
        if(err) return reject(err);
        return resolve(body);
      });
    });
  }

  private buildUrl(path: string): string {
    return "https://" + this.config.get('domain') + path;
  }

  private attachOptions(options?: Object) {
    var opts = _.clone(options || {});
    opts.json = true;
    opts.auth = { username: this.config.get('username'), password: this.config.get('password') };
    return opts;
  }

}
