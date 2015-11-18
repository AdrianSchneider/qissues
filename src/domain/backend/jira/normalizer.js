'use strict';

var util                = require('util');
var moment              = require('moment');
var sprintf             = require('util').format;
var issueRequirements   = require('./requirements/issue');
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
 * @param {JiraMetadata} metadata
 * @param {Object} config
 */
function JiraNormalizer(metadata, config) {
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
    var json = {
      fields: {
        project: { key: newIssue.get('project').getId() },
        summary: newIssue.getTitle(),
        description: newIssue.getDescription(),
        issuetype: { name: newIssue.get('type').getType() }
      }
    };

    if (newIssue.has('assignee')) {
      json.fields.assignee = { name: newIssue.get('assignee').getAccount() };
    }

    return json;
  };

  /**
   * Converts the response from a jira issue into an Issue
   *
   * @param {Object} response
   * @return {Issue}
   */
  this.toIssue = function(response) {
    return new Issue(
      response.key,
      response.fields.summary,
      response.fields.description,
      new Status(response.fields.status.name),
      (function() {
        var meta = {};

        if (response.fields.created)       meta.dateCreated = moment(response.fields.created).toDate();
        if (response.fields.updated)       meta.dateUpdated = moment(response.fields.updated).toDate();
        if (response.fields.assignee)      meta.assignee    = new User(response.fields.assignee.name);
        if (response.fields.reporter)      meta.reporter    = new User(response.fields.reporter.name);
        if (response.fields.priority)      meta.priority    = new Priority(response.fields.priority.id, response.fields.priority.name);
        if (response.fields.issuetype)     meta.type        = new Type(response.fields.issuetype.name);

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
    return new IssuesCollection(response.issues.map(normalizer.toIssue));
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
    return new CommentsCollection(response.comments.map(normalizer.toComment));
  };

  this.getIssueUrl = function(num, filters) {
    return sprintf('https://%s/browse/%s?jql=%s', config.get('domain'), num, this.filterSetToJql(filters));
  };

  this.getQueryUrl = function(filters) {
    return sprintf('https://%s/issues/?jql=%s', config.get('domain'), this.filterSetToJql(filters));
  };

  /**
   * Convert the filters into JQL
   * @return string
   */
  this.filterSetToJql = function(filterSet) {
    return filterSet.flatten().map(function(filter) {
      if (filter[0] === 'sprint' && filter[1][0] === 'Active Sprints') {
        return 'sprint in openSprints()';
      }

      return filter[0]  +' in (' +
        filter[1].map(function(item) {
          return "'" + item.replace(/'/g, "\\'") + "'";
        }).join(',') +
      ')';
    }).join(' AND ');
  };

}

util.inherits(JiraNormalizer, TrackerNormalizer);

module.exports = JiraNormalizer;
