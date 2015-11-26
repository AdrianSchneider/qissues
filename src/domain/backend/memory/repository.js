'use strict';

var _                 = require('underscore');
var util              = require('util');
var Promise           = require('bluebird');
var TrackerRepository = require('../../model/trackerRepository');

function InMemoryRepository(normalizer) {
  TrackerRepository.call(this);

  var lastId = 0;
  var issues = [];
  var comments = {};

  /**
   * Creates a new issue in memory
   *
   * @param {NewIssue} newIssue
   * @return {Promise<String>}
   */
  this.createIssue = function(newIssue) {
    var issue = normalizer.newIssueToJson(newIssue);
    issue.id = getNextId();
    issues.push(issue);
    return Promise.resolve(issue.id);
  };

  /**
   * Fetches an issue by its number
   *
   * @param {String} num
   * @param {Boolean} invalidate - bypass cache
   * @return {Promise<Issue>} - promised array of issues
   */
  this.lookup = function(num, invalidate) {
    return Promise.resolve(_.findWhere(issues, { id: num }));
  };

  this.query = function(report, invalidate) {

  };

  this.getComments = function(num, invalidate) {
    return Promise.resolve(
      comments[num] ? comments[num] : []
    );
  };

  this.postComment = function(newComment) {

  };

  this.apply = function(changeset, details) {

  };

  var getNextId = function() {
    lastId++;
    return '' + lastId;
  };
}

util.inherits(InMemoryRepository, TrackerRepository);

module.exports = InMemoryRepository;
