'use strict';

var Promise = require('bluebird');
var expect  = require('chai').expect;
var f       = require('../../../src/util/f');

describe('Functional Utilities', function() {

  describe('#tee', function() {

    it('Returns a function that copies the input into a variable', function() {
      var getData = function() { return Promise.resolve(5); };
      var data = {};
      return getData()
        .then(f.tee(data, 'key'))
        .then(function() {
          expect(data.key).to.equal(5);
        });
    });

  });

});
