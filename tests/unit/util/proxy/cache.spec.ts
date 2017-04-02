import { assert }    from 'chai';
import CacheProxy    from '../../../../src/util/proxy/cache';
import Cache   from '../../../../src/system/cache/storage';
import MemoryStorage  from '../../../../src/system/storage/memory';

describe('Cache Proxy', () => {

  var proxier;
  var cache: Cache;
  beforeEach(() => {
    cache = new Cache(new MemoryStorage());
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

  it('Falls back to metadata call and caches result', async () => {
    const o = { getUsers: () => Promise.resolve([]) };
    const proxy = proxier.createProxy(o, {
      predicate: () => true,
      cacheKey: () => 'users'
    });

    const users = await proxy.getUsers();
    const cachedUsers = await cache.get('users');

    assert.deepEqual(users, cachedUsers);
  });

  it('Respects arguments and context of proxied method call', async () => {
    const Src = function() {
      this._name = 'adr';
      this.getUsers = function() { return Promise.resolve([this._name]) }
    };

    const src = new Src();
    const proxy = proxier.createProxy(src, {
      predicate: () => true,
      cacheKey: () => 'users'
    });

    const users = await proxy.getUsers();
    assert.equal(users[0], 'adr');
  });

  it('Can override serialize/unserialize');
  it('Can override ttl');

});
