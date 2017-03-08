import HttpClient from '../../src/domain/shared/httpClient';

class MockHttpClient implements HttpClient {

  private mocks: MockResponse[] = [];

  /**
   * Sets up a mock response
   */
  public mock(method: string, path: string, query: Object, response: any): void {
    this.mocks.push({
      method: method.toLowerCase(),
      path: path,
      query: query || {},
      response: response
    });
  }

  public clearMocks(): void {
    this.mocks = [];
  }

  /**
   * Finds the mock, if any, that match the call
   */
  private handle(method: string, path: string, query?: Object) {
    const matching = this.mocks.find(mock => {
      return (
        method === mock.method &&
        path === mock.path &&
        Object.keys(mock.query).every(key => query['params'][key] === mock.query[key])
      );
    });

    if (matching) return Promise.resolve(matching.response);
    return Promise.reject(new Error('no matching mock responses'));
  }

  public get(path: string, query?: Object): Promise<any> {
    return this.handle('get', path, query || {});
  }

  public put(path: string, data?: Object): Promise<any> {
    return this.handle('put', path, data || {});
  }

  public post(path: string, data?: Object): Promise<any> {
    return this.handle('post', path, data || {});
  }

  public delete(path: string): Promise<any> {
    return this.handle('delete', path);
  }

}

interface MockResponse {
  method: string,
  path: string,
  query: Object,
  response: any
}

export default MockHttpClient;
