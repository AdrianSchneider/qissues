'use strict';

var _                 = require('underscore');
var util              = require('util');
var Promise           = require('bluebird');
var TrackerRepository = require('../../model/trackerRepository');

/**
 * In-memory repository
 * Used for tests and demonstrating general business logic
 */
function InMemoryRepository(normalizer) {
  TrackerRepository.call(this);

  var lastId = 0;
  var issues = [];
  var comments = {};

  this.empty = function() {
    issues = [];
    comments = {};
    lastId = 0;
  };

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
   * @param {Boolean} invalidate - ignored
   * @return {Promise<Issue>} - promised array of issues
   */
  this.lookup = function(num, invalidate) {
    return Promise.resolve(
      normalizer.toIssue(
        _.findWhere(issues, { id: num })
      )
    );
  };

  /**
   * Runs a query against the issues
   *
   * @param {Report} report
   * @param {Boolean} invalidate - ignored
   */
  this.query = function(report, invalidate) {
    return Promise.resolve(
      normalizer.toIssuesCollection(
        issues.filter(normalizer.filterIssues(report))
      )
    );
  };

  /**
   * Fetches comments for a given issue
   *
   * @param {String} num
   * @param {Boolean} invalidate
   * @return {Promise<CommentsCollection>}
   */
  this.getComments = function(num, invalidate) {
    return Promise.resolve(normalizer.toCommentsCollection(comments[num] || []));
  };

  /**
   * Posts a new comment
   *
   * @param {NewComment} newComment
   * @return {Promise}
   */
  this.postComment = function(newComment) {
    var id = newComment.getIssue();
    if (typeof comments[id] === 'undefined') {
      comments[id] = [];
    }

    comments[id].push(normalizer.newCommentToJson(newComment));
  };

  /**
   * Applies a changeset
   *
   * @param {ChangeSet} changeset
   * @param {Object|null} details
   */
  this.apply = function(changeset, details) {

  };

  /**
   * Generates a new unique identifier
   *
   * @return {String}
   */
  var getNextId = function() {
    return (++lastId).toString();
  };
}

util.inherits(InMemoryRepository, TrackerRepository);

module.exports = InMemoryRepository;
