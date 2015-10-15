'use strict';

var expect          = require('chai').expect;
var Promise         = require('bluebird');
var ValidationError = require('../../../../src/errors/validation');
var Expectations    = require('../../../../src/domain/model/expectations');

describe('Expectations', function() {

  describe('#getValues', function() {

  });

  describe('#getSuggestions', function() {

  });

  describe('#ensureValid', function() {

    beforeEach(function() {
      this.expectations = new Expectations({
        title: { type: 'string', required: true },
        assignee: { type: 'string', required: true, choices: Promise.resolve(['adrian']) }
      });
    });

    it('Passes when all required fields match', function() {
      this.expectations = new Expectations({ title: { type: 'string', required: true } });
      return this.expectations.ensureValid({ title: 'hello' });
    });

    it('Fails when required fields are missing', function() {
      this.expectations = new Expectations({ title: { type: 'string', required: true } });
      return this.expectations.ensureValid({ title: '' })
        .catch(ValidationError, function(e) {
          expect(e.message).to.contain('title');
        });
    });

    it('Passes when using a preselected choice', function() {
      var choices = Promise.resolve(['adrian']);
      this.expectations = new Expectations({ title: { type: 'string', required: true, choices: choices } });
      return this.expectations.ensureValid({ title: 'adrian' });
    });

    it('Fails when not using a preselected choice', function() {
      var choices = Promise.resolve(['adrian']);
      this.expectations = new Expectations({ title: { type: 'string', required: true, choices: choices } });
      return this.expectations.ensureValid({ title: 'dude' })
        .catch(ValidationError, function(e) {
          expect(e.message).to.contain('must be one of');
        });
    });

    it('Fails when not using a preselected choice', function() {
      var choices = Promise.resolve(['adrian', 'joe']);
      this.expectations = new Expectations({ title: { type: 'string', required: true, choices: choices } });
      return this.expectations.ensureValid({ title: 'dude' })
        .catch(ValidationError, function(e) {
          expect(e.message).to.contain('must be one of');
        });
    });


  });

});
