import * as Promise from 'bluebird';

interface HttpClient {
  get: (path: string, query?: Object) => Promise<any>;
  put: (path: string, data?: Object) => Promise<any>;
  post: (path: string, data?: Object) => Promise<any>;
  delete: (path: string) => Promise<any>;
}

export default HttpClient;
