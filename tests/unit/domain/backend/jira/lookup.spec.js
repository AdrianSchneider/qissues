'use strict';

var expect     = require('chai').expect;
var nodemock   = require('nodemock');
var Promise    = require('bluebird');
var Issue      = require('../../../../../src/domain/model/issue');
var jiraLookup = require('../../../../../src/domain/backend/jira/lookup');

describe('Jira Lookup', function() {

  beforeEach(function() {
    this.client = nodemock.mock();
    this.cache = nodemock.mock();
    this.lookup = jiraLookup(this.client, this.cache);

    this.id = 'PROJ-1';
    this.response = { id: this.id };
  });

  it('Returns the cached copy when available', function() {
    this.cache
      .mock('get')
      .takes('lookup:' + this.id, undefined)
      .returns(this.response);

    return this.lookup(this.id).then(ensureIssue);
  });

  it('Fetches data from jira when cache is unavailable', function() {
    this.cache
      .mock('get')
      .takes('lookup:' + this.id, undefined);

    this.client
      .mock('get')
      .takes('/rest/api/2/issue/' + this.id)
      .returns(Promise.resolve(this.response));

    this.cache
      .mock('setThenable')
      .takes('lookup:' + this.id)
      .returns(function(result) {
        return result;
      });

    return this.lookup(this.id).then(ensureIssue);
  });

  it('Fetches data from jira when invalidate is passed', function() {
    this.cache
      .mock('get')
      .takes('lookup:' + this.id, true);

    this.client
      .mock('get')
      .takes('/rest/api/2/issue/' + this.id)
      .returns(Promise.resolve(this.response));

    this.cache
      .mock('setThenable')
      .takes('lookup:' + this.id)
      .returns(function(result) {
        return result;
      });

    return this.lookup(this.id, true).then(ensureIssue);
  });

  var ensureIssue = function(issue) {
    expect(issue).to.be.an.instanceof(Issue);
  };

});
