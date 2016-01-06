'use strict';

var expect = require('chai').expect;
var ChangeSet = require('../../../../src/domain/model/changeSet');

describe('ChangeSet', function() {

  describe('#constructor', function() {

    it('Throws TypeError when not issue ids', function() {
      var badInputs = [ [0], [0, 'a'], 'string', {} ];
      badInputs.forEach(function(input) {
        expect(function() { new ChangeSet(input, { a: 1 }); }).to.throw(TypeError, 'array of issue ids');
      });
    });

    it('Throws TypeError when not an object of changes', function() {
      var badInputs = [ {}, null, undefined, 'blah' ];
      badInputs.forEach(function(input) {
        expect(function() { new ChangeSet(['a'], input); }).to.throw(TypeError, 'object of changes');
      });
    });

    it('Constructs with an array of strings', function() {
      new ChangeSet(['a', 'b'], { a: 1 });
    });

  });

  describe('#getIssue', function() {

    it('Returns the array of issue ids', function() {
      var changeset = new ChangeSet(['a', 'b'], { a: 1 });
      expect(changeset.getIssues()).to.deep.equal(['a', 'b']);
    });

  });

});
