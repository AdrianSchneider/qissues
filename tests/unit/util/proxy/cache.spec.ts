import { assert }    from 'chai';
import Cache         from '../../../../src/app/services/cache';
import CacheProxy    from '../../../../src/util/proxy/cache';
import MemoryCache   from '../../../../src/system/cache/memory';

describe('Cache Proxy', () => {

  var proxier;
  var cache: Cache;
  beforeEach(() => {
    cache = new MemoryCache();
    proxier = new CacheProxy(cache);
  });

  it('Skips methods that dont match', () => {
    cache.get = () => { throw new Error('dont even try to query cache'); };
    const proxy = proxier.createProxy({ someMethod: () => 5 }, { predicate: () => false });
    assert.equal(proxy.someMethod(), 5);
  });

  it('Short circuits and returns from cache when available', () => {
    return cache.set('cache key', [{ id: 1, name: 'adrian' }] ).then(() => {
      const o = { getUsers: () => { throw new Error('do not call'); } };
      const proxy = proxier.createProxy(o, {
        predicate: () => true,
        cacheKey: () => 'cache key'
      });

      return proxy.getUsers()
        .then(users => assert.equal(users.length, 1));
    });
  });

  it('Falls back to metadata call and caches result', () => {
    const o = { getUsers: () => Promise.resolve([]) };
    const proxy = proxier.createProxy(o, {
      predicate: () => true,
      cacheKey: () => 'users'
    });

    return proxy.getUsers()
      .then(users => {
        return cache.get('users').then(cached => {
          assert.deepEqual(cached, users);
        });
      });
  });

  it('Respects arguments and context of proxied method call', () => {
    const Src = function() {
      this._name = 'adr';
      this.getUsers = function() { return Promise.resolve([this._name]) }
    };

    const src = new Src();
    const proxy = proxier.createProxy(src, {
      predicate: () => true,
      cacheKey: () => 'users'
    });

    return proxy.getUsers()
      .then(users => assert.equal(users[0], 'adr'));
  });

  it('Can override serialize/unserialize');
  it('Can override ttl');

});
