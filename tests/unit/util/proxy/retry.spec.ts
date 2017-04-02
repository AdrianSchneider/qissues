import { assert } from 'chai';
import RetryProxy from '../../../../src/util/proxy/retry';

describe('Retry Proxy', () => {

  var proxier: RetryProxy;
  var service = {};

  beforeEach(() => {
    proxier = new RetryProxy();
  });

  it('Jsut traps method calls', () => {
    service['name'] = 'adrian';
    const proxy = proxier.createProxy(service);
    assert.equal(service['name'], 'adrian');
  });

  it('Jsut retries failures matching the predicate', () => {
    service['getName'] = () => Promise.reject(new Error('403'));
    const proxy = proxier.createProxy(service, {
      errorPredicate: e => e.message !== '403'
    });

    return proxy['getName']()
      .then(e => { throw new Error('should not pass'); })
      .catch(e => assert.equal(e.message, '403'));
  });

  it('Retries the failure', async () => {
    let attempts = 0;
    service['getName'] = () => {
      if (!attempts) {
        attempts++;
        return Promise.reject(new Error('ENOTFOUND'));
      }
      return Promise.resolve(200);
    };

    const proxy = proxier.createProxy(service);
    assert.equal(await proxy['getName'](), 200);
  });

  it('Retries the failure up to <times> times', async () => {
    const max = 10;
    let attempts = 0;

    service['getName'] = () => {
      if (attempts < max) {
        attempts++;
        return Promise.reject(new Error('ENOTFOUND'));
      }

      return Promise.resolve(attempts);
    };

    const proxy = proxier.createProxy(service, { times: max });
    assert.equal(await proxy['getName'](), max);
  });

  it('Fails after max attempts', () => {
    const max = 10;
    let attempts = 0;

    service['getName'] = () => {
      if (attempts < max) {
        attempts++;
        return Promise.reject(new Error('ENOTFOUND'));
      }

      return Promise.resolve(attempts);
    };

    const proxy = proxier.createProxy(service, { times: max - 1 });
    return proxy['getName']()
      .then(response => { throw new Error('should not get here'); })
      .catch(error => assert.equal(error.message, 'ENOTFOUND'))
  });

  it('Can backoff', () => {
    const max = 10;
    let attempts = 0;

    service['getName'] = () => {
      if (attempts < max) {
        attempts++;
        return Promise.reject(new Error('ENOTFOUND'));
      }

      return Promise.resolve(attempts);
    };

    const backoff = (attempts: number) => 1;
    const proxy = proxier.createProxy(service, { times: max, backoff });
    return proxy['getName']().then(response => assert.equal(response, max));
  });

});
