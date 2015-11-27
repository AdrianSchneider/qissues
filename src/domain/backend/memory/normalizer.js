'use strict';

var _ = require('underscore');
var util                = require('util');
var moment              = require('moment');
var sprintf             = require('util').format;
//var issueRequirements   = require('./requirements/issue');
var Issue               = require('../../model/issue');
var IssuesCollection    = require('../../model/issues');
var Comment             = require('../../model/comment');
var CommentsCollection  = require('../../model/comments');
var NewIssue            = require('../../model/newIssue');
var NewComment          = require('../../model/newComment');
var TrackerNormalizer   = require('../../model/trackerNormalizer');
var User                = require('../../model/meta/user');
var Label               = require('../../model/meta/label');
var Priority            = require('../../model/meta/priority');
var Sprint              = require('../../model/meta/sprint');
var Type                = require('../../model/meta/type');
var Status              = require('../../model/meta/status');
var Project             = require('../../model/meta/project');

/**
 * In-memory normalizer
 * Basic transformations to showcase a generic tracker model
 *
 * @param {InMemoryMetadata} metadata
 * @param {Object} config
 */
function InMemoryNormalizer(metadata, config) {
  TrackerNormalizer.call(this);
  var normalizer = this;

  /**
   * Gets the requirements for creating/editing an issue
   *
   * @param {Issue|null} existing
   * @return {Expectations}
   */
  this.getNewIssueRequirements = function(existing) {
    return issueRequirements[existing ? 'update' : 'create'](metadata);
  };

  /**
   * Converts the required jira data fields into a new issue
   *
   * @param {Object} data
   * @return {NewIssue}
   */
  this.toNewIssue = function(data) {
    return new NewIssue(data.title, data.description, (function() {
      var meta = {};

      if (data.type)     meta.type     = new Type(null, data.type);
      if (data.assignee) meta.assignee = new User(data.assignee);
      if (data.sprint)   meta.sprint   = new Sprint(null, data.sprint);
      if (data.priority) meta.priority = new Priority(data.priority);
      if (data.project)  meta.project  = new Project(data.project);
      if (data.status)   meta.status   = new Status(data.status);

      return meta;
    })());
  };

  /**
   * Converts a new issue into the json payload that jira accepts
   *
   * @param {NewIssue} newIssue
   * @return {Object}
   */
  this.newIssueToJson = function(newIssue) {
    return ['assignee', 'project', 'type', 'status']
      .filter(function(field) { return newIssue.has(field); })
      .reduce(function(json, field) {
        json[field] = newIssue.get(field);
        return json;
    }, {
      title: newIssue.getTitle(),
      description: newIssue.getDescription(),
      created: new Date(),
      updated: new Date()
    });
  };

  /**
   * Converts the response from a jira issue into an Issue
   *
   * @param {Object} response
   * @return {Issue}
   */
  this.toIssue = function(response) {
    return new Issue(
      response.id,
      response.title,
      response.description,
      new Status(response.status),
      (function() {
        var meta = {};

        if (response.created)       meta.dateCreated = moment(response.created).toDate();
        if (response.updated)       meta.dateUpdated = moment(response.updated).toDate();
        if (response.assignee)      meta.assignee    = new User(response.assignee.name);
        if (response.reporter)      meta.reporter    = new User(response.reporter.name);
        if (response.priority)      meta.priority    = new Priority(response.priority.id, response.priority.name);
        if (response.issuetype)     meta.type        = new Type(response.type.name);

        return meta;
      })()
    );
  };

  this.toNum = function(response) {
    return response.key;
  };

  /**
   * Converts a response from JIRA to a collection of issues
   *
   * @param {Object} response
   * @return {IssuesCollection}
   */
  this.toIssuesCollection = function(response) {
    return new IssuesCollection(response.map(normalizer.toIssue));
  };

  /**
   * Converts the response from a jira comment into a Comment
   *
   * @param {Object} response
   * @return {Comment}
   */
  this.toComment = function(response) {
    return new Comment(
      response.body,
      new User(response.author.key),
      response.created
    );
  };

  this.toCommentsCollection = function(response) {
    return new CommentsCollection(response.map(normalizer.toComment));
  };

  this.newCommentToJson = function(newComment) {
    return { message: newComment.getMessage() };
  };

  this.getIssueUrl = function(num, filters) {
    return sprintf('https://%s/browse/%s?jql=%s', config.get('domain'), num, this.filterSetToJql(filters));
  };

  this.getQueryUrl = function(filters) {
    return sprintf('https://%s/issues/?jql=%s', config.get('domain'), this.filterSetToJql(filters));
  };

  this.filterIssues = function(report) {
    var filters = _.values(
      report.getFilters().serialize().reduce(function(filters, filter) {
        if (typeof filters[filter.type] === 'undefined') {
          filters[filter.type] = { type: filter.type, values: [] };
        }
        filters[filter.type].values.push(filter.value);
        return filters;
      }, {})
    );

    return function(issue) {
      return _.every(filters, function(filter) {
        var value = issue[filter.type] || '';
        return filter.values.indexOf(value.toString()) !== -1;
      });
    };
  };

}

util.inherits(InMemoryNormalizer, TrackerNormalizer);

module.exports = InMemoryNormalizer;
