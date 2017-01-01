import { assert }         from 'chai';
import Cache              from '../../../../src/app/services/cache';
import MemoryStorage      from '../../../../src/app/services/storage/memory';
import User               from '../../../../src/domain/model/meta/user';
import MetadataCacheProxy from '../../../../src/domain/backend/metadataCacheProxy';

describe('Cache Metadata Proxy', () => {

  var proxier;
  var cache;
  beforeEach(() => {
    cache = new Cache(new MemoryStorage());
    proxier = new MetadataCacheProxy(cache);
  });

  it('Skips methods that dont match', () => {
    cache.get = () => { throw new Error('dont even try to query cache'); };
    const proxy = proxier.createProxy({ someMethod: () => 5 });
    assert.equal(proxy.someMethod(), 5);
  });

  it('Short circuits and returns from cache when available', () => {
    cache.set('users', [{ id: 1, name: 'adrian' }] );
    const proxy = proxier.createProxy({ getUsers: () => { throw new Error('do not call'); } });
    return proxy.getUsers()
      .then(users => assert.equal(users.length, 1));
  });

  it('Falls back to metadata call and caches result', () => {
    const proxy = proxier.createProxy({ getUsers: () => Promise.resolve([]) });
    return proxy.getUsers()
      .then(users => {
        assert.equal(users.length, 0);
        assert.typeOf(cache.get('users'), 'array');
      });
  });

  it('Respects arguments and context of proxied method call', () => {
    const Src = function() {
      this._name = 'adr';
      this.getUsers = function() { return Promise.resolve([new User(this._name)]) };
    };

    const src = new Src();
    const proxy = proxier.createProxy(src);

    return proxy.getUsers()
      .then(users => assert.equal(users[0].account, 'adr'));
  });

});
