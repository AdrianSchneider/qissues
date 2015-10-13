'use strict';

var util                  = require('util');
var Issue                 = require('../../model/issue');
var IssuesCollection      = require('../../model/issues');
var NewIssue              = require('../../model/newIssue');
//var Comment             = require('../../model/comment');
var NewComment            = require('../../model/newComment');
var issueRequirements     = require('./requirements/issue');
//var commentRequirements = require('./requirements/comment');
var ValidationError       = require('../../../errors/validation');
var TrackerNormalizer     = require('../../model/trackerNormalizer');

/**
 * @param {JiraMetadata} metadata
 * @param {Object} config
 */
function JiraNormalizer(metadata, config) {
  TrackerNormalizer.call(this);

  /**
   * Gets the requirements for creating/editing an issue
   *
   * @param {Issue|null} existing
   * @return {Joi.Schema}
   */
  this.getNewIssueRequirements = function(existing) {
    return existing ? issueRequirements.update(existing) : issueRequirements.create();
  };

  /**
   * Converts the required jira data fields into a new issue
   *
   * @param {Object} data
   * @return {NewIssue}
   */
  this.toNewIssue = function(data) {
    return new NewIssue(
      config.project,
      data.title,
      data.description,
      data.type
    );
  };

  /**
   * Converts the response from a jira issue into an Issue
   *
   * @param {Object} response
   * @return {Issue}
   */
  this.toIssue = function(response) {
    return new Issue(response);
  };

  /**
   * Converts a response from JIRA to a collection of issues
   *
   * @param {Object} response
   * @return {IssuesCollection}
   */
  this.toIssuesCollection = function(response) {
    return new IssuesCollection(response.issues.map(this.toIssue));
  };

  /**
   * Gets the requirements for posting a comment
   *
   * @return {Joi.Schema}
   */
  this.getNewCommentRequirements = function() {

  };

  /**
   * Converts the required jira comment fields into a new comment
   *
   * @param {Object} data
   * @return {NewComment}
   */
  this.toNewComment = function(data) {
    return new NewComment();
  };

  /**
   * Converts the response from a jira comment into a Comment
   *
   * @param {Object} response
   * @return {Comment}
   */
  this.toComment = function(response) {
    return new Comment();
  };

};

util.inherits(JiraNormalizer, TrackerNormalizer);

module.exports = JiraNormalizer;
