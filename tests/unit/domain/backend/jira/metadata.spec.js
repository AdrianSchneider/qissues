'use strict';

var expect       = require('chai').expect;
var nodemock     = require('nodemock');
var Promise      = require('bluebird');
var JiraMetadata = require('../../../../../src/domain/backend/jira/metadata');
var Label        = require('../../../../../src/domain/model/meta/label');
var User         = require('../../../../../src/domain/model/meta/user');
var Sprint       = require('../../../../../src/domain/model/meta/sprint');
var Type         = require('../../../../../src/domain/model/meta/type');
var Status       = require('../../../../../src/domain/model/meta/status');
var Project      = require('../../../../../src/domain/model/meta/project');

describe('Jira Metadata', function() {

  beforeEach(function() {
    this.client = nodemock.mock();
    this.cache = nodemock.mock();
    this.metadata = new JiraMetadata(this.client, this.cache);
  });

  describe('#getTypes', function() {

    it('Returns a cached copy of Types when available', function() {
      this.cache
        .mock('get')
        .takes('types', false)
        .returns([{ id: 5, type: "bug" }]);

      return this.metadata.getTypes(false)
        .then(function(types) {
          expect(types[0].getType()).to.equal('bug');
        });
    });

    it('Returns types from jira and converts to Types, updating cache', function() {
      this.cache
        .mock('get')
        .takes('types', false)
        .returns(null);

      this.client
        .mock('get')
        .takes('/rest/api/2/issue/createmeta')
        .returns(Promise.resolve({
          projects: [{ issuetypes: [{ id: 5, name: "feature" }] }]
        }));

      this.cache
        .mock('setSerializedThenable')
        .takes('types', 86400)
        .returns(function(data) { return data; });

      return this.metadata.getTypes(false)
        .then(function(types) {
          expect(types[0].getType()).to.equal('feature');
        });
    });

    it('Removes duplicates from different projects', function() {
      this.cache
        .mock('get')
        .takes('types', false)
        .returns(null);

      this.client
        .mock('get')
        .takes('/rest/api/2/issue/createmeta')
        .returns(Promise.resolve({
          projects: [
            { issuetypes: [{ id: 1, name: "feature" }] },
            { issuetypes: [{ id: 1, name: "feature" }] }
          ]
        }));

      this.cache
        .mock('setSerializedThenable')
        .takes('types', 86400)
        .returns(function(data) { return data; });

      return this.metadata.getTypes(false)
        .then(function(types) {
          expect(types).to.have.length(1);
        });
    });

  });

  describe('#getUsers', function() {

  });

  describe('#getViews', function() {

  });

  describe('#getSprints', function() {

  });

  describe('#getLabels', function() {

  });

  describe('#getProjects', function() {

  });

  describe('#getStatuses', function() {

  });

});
