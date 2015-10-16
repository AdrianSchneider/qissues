'use strict';

var expect         = require('chai').expect;
var nodemock       = require('nodemock');
var Promise        = require('bluebird');
var JiraRepository = require('../../../../../src/domain/backend/jira/repository');

describe('Jira Repository', function() {

  beforeEach(function() {
    this.client = nodemock.mock();
    this.cache = nodemock.mock();
    this.normalizer = nodemock.mock();
    this.repository = new JiraRepository(this.client, this.cache, this.normalizer);
  });

  afterEach(function() {
    this.client.assertThrows();
    this.normalizer.assertThrows();
    this.cache.assertThrows();
  });

  describe('#createIssue', function() {

    it('Posts a NewIssue, normalizing the fields', function() {
      var newIssue = { isa: 'newissue' };
      var normalized = { title: "New Issue" };

      this.normalizer
        .mock('newIssueToJson')
        .takes(newIssue)
        .returns(normalized);

      this.client
        .mock('post')
        .takes('/rest/api/2/issue', normalized)
        .returns(Promise.resolve('DEV-111'));

      return this.repository.createIssue(newIssue)
        .then(function(id) {
          expect(id).to.equal('DEV-111');
        });
    });

  });

  describe('#lookup', function() {

    it('Returns cached Issue when one is available', function() {
      var cached = { issue: false };
      var issue = { issue: true };

      this.cache
        .mock('get')
        .takes('lookup:5', false)
        .returns(cached);

      this.normalizer
        .mock('toIssue')
        .takes(cached)
        .returns(issue);

      return this.repository.lookup('5', false)
        .then(function(i) {
          expect(i).to.deep.equal(issue);
        });
    });

    it('Returns Issue from JIRA when no cache is available', function() {
      var response = { issue: false };
      var issue = { issue: true };

      this.cache
        .mock('get')
        .takes('lookup:5', false)
        .returns(null);

      this.client
        .mock('get')
        .takes('/rest/api/2/issue/5')
        .returns(Promise.resolve(response));

      this.normalizer
        .mock('toIssue')
        .takes(response)
        .returns(issue);

      this.cache
        .mock('setThenable')
        .takes('lookup:5')
        .returns(function(data) {
          return Promise.resolve(data);
        });

      return this.repository.lookup('5', false)
        .then(function(i) {
          expect(i).to.deep.equal(issue);
        });
    });

  });

});
