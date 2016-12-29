import { assert }     from 'chai';
import * as moment    from 'moment';
import Promise        from 'bluebird';
import Cache          from '../../../../src/app/services/cache';

describe('Cache', function() {

  describe('cache keys', () => {
    it('respects the configured prefix');
    it('respects the configured hasher');
    it('md5s keys by default');
  });

  var storage;
  var cache: Cache;
  beforeEach(function() {
    storage = {};
    cache = new Cache(storage, '', str => str);
  });

  describe('#get', function() {

    it('Returns undefined when invalidate flag is passed', function() {
      assert.equal(cache.get('anything', true), undefined);
    });

    it('Returns undefined when key has expired', function() {
      storage.get = storageKey => ({ expires: moment().subtract(1, 'hour').toDate() });
      assert.equal(cache.get('key'), undefined);
    });

    it('Returns the value when its still valid', function() {
      storage.get = key => ({ data: 'cool beans', expires: moment().add(1, 'hour').toDate() });
      assert.equal(cache.get('key'), 'cool beans');
    });

  });

  describe('#set', function() {

    it('Sets the data in storage', done => {
      storage.set = (key, value) => {
        assert.equal(key, 'key');
        assert.deepEqual(value.data, 'cool beans');
        return done();
      };

      cache.set('key', 'cool beans');
    });

    it('Setting a ttl stores it in the entry', done => {
      storage.set = (key, value) => {
        assert.approximately(
          Date.now() / 3600,
          value.expires.getTime() / 3600,
          1
        );
        return done();
      };

      cache.set('key', 'cool beans', 1);
    });

  });

  describe('#invalidate', function() {

    it('Invalidates a cache entry', function() {
      storage.remove = key => assert.equal(key, 'key');
      cache.invalidate('key');
    });

  });

  describe('#invalidateAll', function() {

  });

  describe('#clean', function() {

  });

});
