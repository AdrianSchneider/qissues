import { assert }   from 'chai';
import * as moment  from 'moment';
import * as Promise from 'bluebird';
import Cache        from '../../../../src/system/cache/storage';

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
      return cache.get('anything', true).then(cached => {
        assert.equal(cached, undefined);
      });
    });

    it('Returns undefined when key has expired', function() {
      storage.get = storageKey => ({ expires: moment().subtract(1, 'hour').toDate() });
      return cache.get('key').then(cached => {
        assert.equal(cached, undefined);
      });
    });

    it('Returns the value when its still valid', function() {
      storage.get = key => ({ data: 'cool beans', expires: moment().add(1, 'hour').toDate() });
      return cache.get('key').then(cached => {
        assert.equal(cached, 'cool beans');
      });
    });

  });

  describe('#set', function() {

    it('Sets the data in storage', done => {
      storage.set = (key, value) => {
        assert.equal(key, 'key');
        assert.deepEqual(value.data, 'cool beans');
        return done();
      };

      return cache.set('key', 'cool beans');
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

      return cache.set('key', 'cool beans', 1);
    });

  });

  describe('#invalidate', function() {

    it('Invalidates a cache entry', function() {
      storage.remove = key => assert.equal(key, 'key');
      return cache.invalidate('key');
    });

  });

  describe('#invalidateAll', function() {

    it('Defaults to removing all', () => {
      storage.keys = () => ['a', 'b'];
      storage.removeMulti = keys => assert.deepEqual(keys, ['a', 'b']);
      return cache.invalidateAll();
    });

    it('Accepts a predicate to remove things by', () => {
      storage.keys = () => ['aa', 'b'];
      storage.removeMulti = keys => assert.deepEqual(keys, ['aa']);
      return cache.invalidateAll(key => key.length > 1);
    });

  });

  describe('#clean', function() {

  });

  describe('#wrap', () => {

    it('Returns the cached result when available', () => {
      const getData = () => 'cool beans';
      storage.get = key => {
        assert.equal(key, 'hit');
        return { data: getData(), expires: moment().add(1, 'hour').toDate() };
      };

      return cache.wrap(
        'hit',
        () => Promise.resolve(getData()),
        false
      ).then(result => assert.deepEqual(result, 'cool beans'));
    });

    it('Returns the live result and updates cache when cache unavailable', () => {
      const d = { expensive: true };
      const getData = () => d;

      storage.get = key => null;
      storage.set = (key, value) => assert.deepEqual(value.data, d);

      return cache.wrap(
        'key miss',
        () => Promise.resolve(getData()),
        false
      ).then(result => assert.deepEqual(result, d));
    });

  });

});
