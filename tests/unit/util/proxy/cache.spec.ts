import { assert }    from 'chai';
import Cache         from '../../../../src/app/services/cache';
import MemoryStorage from '../../../../src/app/services/storage/memory';
import CacheProxy    from '../../../../src/util/proxy/cache';

describe('Cache Proxy', () => {

  var proxier;
  var cache;
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
    cache.set('cache key', [{ id: 1, name: 'adrian' }] );
    const o = { getUsers: () => { throw new Error('do not call'); } };
    const proxy = proxier.createProxy(o, {
      predicate: () => true,
      cacheKey: () => 'cache key'
    });

    return proxy.getUsers()
      .then(users => assert.equal(users.length, 1));
  });

  it('Falls back to metadata call and caches result', () => {
    const o = { getUsers: () => Promise.resolve([]) };
    const proxy = proxier.createProxy(o, {
      predicate: () => true,
      cacheKey: () => 'users'
    });

    return proxy.getUsers()
      .then(users => {
        assert.equal(users.length, 0);
        assert.typeOf(cache.get('users'), 'array');
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
