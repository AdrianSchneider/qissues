'use strict';

var expect   = require('chai').expect;
var nodemock = require('nodemock');
var moment   = require('moment');
var Promise  = require('bluebird');
var Cache    = require('../../../../src/app/services/cache');

describe('Cache', function() {

  beforeEach(function() {
    this.storage = nodemock.mock();
    this.cache = new Cache(this.storage, false, function(key) { return key; });
  });

  afterEach(function() {
    this.storage.assertThrows();
  });

  describe('#get', function() {

    it('Returns undefined when invalidate flag is passed', function() {
      expect(this.cache.get('anything', true)).to.equal(undefined);
    });

    it('Returns undefined when key has expired', function() {
      this.storage
        .mock('get')
        .takes('cache:key')
        .returns({ expires: moment().subtract(1, 'hour').toDate() });

      expect(this.cache.get('key')).to.equal(undefined);
    });

    it('Returns the value when its still valid', function() {
      this.storage
        .mock('get')
        .takes('cache:key')
        .returns({
          data: 'cool beans',
          expires: moment().add(1, 'hour').toDate()
        });

      expect(this.cache.get('key')).to.equal('cool beans');
    });


  });

  describe('#set', function() {

    it('Sets the data in storage', function() {
      this.storage
        .mock('set')
        .takesF(function(key, entry) {
          expect(key).to.equal('cache:key');
          expect(entry.data).to.equal('cool beans');
          return true;
        });

      this.cache.set('key', 'cool beans');
    });

  });

  describe('#setThenable', function() {

    it('Returns a function that sets the cache value', function() {
      this.storage
        .mock('set')
        .takesF(function(key, entry) {
          expect(key).to.equal('cache:key');
          expect(entry.data).to.equal('cool beans');
          return true;
        });

      var provider = function() { return Promise.resolve('cool beans'); };
      return provider().then(this.cache.setThenable('key'));
    });

  });

  describe('#setSerializedThenable', function() {

    it('Returns a function that sets the cache value after serializing it', function() {
      var obj = [{ serialize: function() { return 'cool beans'; } }];

      this.storage
        .mock('set')
        .takesF(function(key, entry) {
          expect(key).to.equal('cache:key');
          expect(entry.data).to.deep.equal(['cool beans']);
          return true;
        });

      var provider = function() { return Promise.resolve(obj); };
      return provider().then(this.cache.setSerializedThenable('key'));
    });

  });

  describe('#invalidate', function() {

    it('Invalidates a cache entry', function() {
      this.storage
        .mock('remove')
        .takesF(function(key) {
          expect(key).to.equal('cache:key');
          return true;
        });

      this.cache.invalidate('key');
    });

  });

  describe('#invalidateAll', function() {

  });

  describe('#clean', function() {

  });

});
