'use strict';

var _                 = require('underscore');
var util              = require('util');
var Promise           = require('bluebird');
var sprintf           = require('util').format;
var TrackerRepository = require('../../model/trackerRepository');
var MoreInfoRequired  = require('../../errors/infoRequired');

/**
 * Repository for interacting with Jira data
 *
 * @param {JiraHttpClient} client
 * @param {Cache} cache
 * @param {JiraNormalizer} normalizer
 */
function JiraRepository(client, cache, normalizer, metadata, logger) {
  TrackerRepository.call(this);

  /**
   * Creates a new issue on jira
   *
   * @param {NewIssue} newIssue
   * @return {Promise<String>}
   */
  this.createIssue = function(newIssue) {
    return client.post('/rest/api/2/issue', normalizer.newIssueToJson(newIssue))
      .then(normalizer.toNum);
  };

  /**
   * Fetches an issue by its number
   *
   * @param {String} num
   * @param {Boolean} invalidate - bypass cache
   * @return {Promise<Issue>} - promised array of issues
   */
  this.lookup = function(num, invalidate) {
    var cacheId = 'lookup:' + num;
    var cached = cache.get(cacheId, invalidate);
    if (cached) return Promise.resolve(normalizer.toIssue(cached));

    return client.get(getIssueUrl(num))
      .then(cache.setThenable(cacheId))
      .then(normalizer.toIssue);
  };

  /**
   * Fetches issues using a query
   *
   * @param {Report} report
   * @param {Boolean} invalidate - bypass cache
   * @return {Promise<IssuesCollection>} - promised array of issues
   */
  this.query = function(report, invalidate) {
    var options = { qs: { maxResults: 500, jql: normalizer.filterSetToJql(report.getFilters()) } };

    logger.trace('JQL = ' + options.qs.jql);

    var cacheId = 'issues:' + options.qs.jql;
    var cached = cache.get(cacheId, invalidate);
    if (cached) return Promise.resolve(normalizer.toIssuesCollection(cached));

    return client.get('/rest/api/2/search', options)
      .then(cache.setThenable(cacheId))
      .then(normalizer.toIssuesCollection);
  };

  /**
   * Fetches comments
   *
   * @param {String} num
   * @param {Boolean} invalidate - bypcass cache
   */
  this.getComments = function(num, invalidate) {
    var cacheId = 'comments:' + num;
    var cached = cache.get(cacheId, invalidate);
    if (cached) return Promise.resolve(normalizer.toCommentsCollection(cached));

    return client.get(getIssueUrl(num, '/comment'))
      .then(cache.setThenable(cacheId))
      .then(normalizer.toCommentsCollection);
  };

  /**
   * Posts a comment to an issue
   *
   * @param {NewComment} comment
   * @return {Promise}
   */
  this.postComment = function(comment) {
    return client.post(
      getIssueUrl(comment.getIssue(), '/comment'),
      normalizer.newCommentToJson(comment)
    );
  };

  /**
   * Applies a changeset
   *
   * @param {ChangeSet} changes
   */
  this.apply = function(changes, details) {
    cache.invalidateAll(function(key) {
      return key.indexOf('issues:') === 0;
    });
    changes.getIssues().forEach(function(num) {
      cache.invalidate('lookup:' + num);
    });

    var changeFunctions = {
      title    : changeTitle,
      assignee : changeAssignee,
      status   : changeStatus,
      sprint   : changeSprint
    };

    return Promise.each(changes.getChanges(), function(change) {
      var field = change[0];
      var value = change[1];

      if (typeof changeFunctions[field] === 'undefined') {
        throw new Error('Jira cannot apply change for field ' + field);
      }

      return Promise.each(changes.getIssues(), function(issue) {
        return changeFunctions[field](issue, value, details);
      });
    });
  };

  /**
   * Changes a title
   *
   * @param {String} num - id
   * @param {String} title
   * @return {Promise}
   */
  var changeTitle = function(num, title) {
    var data = { fields: { summary: title } };
    return client.put(getIssueUrl(num), data);
  };

  /**
   * Changes the assignee
   *
   * @param {String} num - id
   * @param {String} username
   * @return {Promise}
   */
  var changeAssignee = function(num, username) {
    var data = { name: username === 'Unassigned' ? null : username };
    return client.put(getIssueUrl(num, '/assignee'), data);
  };

  /**
   * Changes the status
   *
   * @param {String} num
   * @param {String} status
   * @param {Object|null} details
   * @return {Promise}
   */
  var changeStatus = function(num, status, details) {
    return metadata.getIssueTransition(num, status).then(function(transition) {
      var expectations = metadata.transitionToExpectations(transition);
      if (expectations.hasRules()) {
        throw new MoreInfoRequired('Jira expects more', expectations);
      }

      var data = {
        transition: { id: transition.id },
        fields: _.mapObject(details, function(value) {
          return { name: value };
        })
      };

      return client.post(getIssueUrl(num, '/transitions'), data);
    });
  };

  /**
   * Changes the sprint
   *
   * @param {String} num
   * @param {String} sprint
   * @return {Promise}
   */
  var changeSprint = function(num, toSprint) {
    if (toSprint === 'Backlog') {
      throw new Error('TODO need to query for current sprint');
    }

    return metadata.getSprints()
      .then(function(sprints) {
        return _.find(sprints, function(sprint) {
          return sprint.getName() === toSprint;
        });
      })
      .then(function(sprint) {

      });
  };

  /**
   * Generates the issue url, optionally appending
   *
   * @param [String} num
   * @param {String|undefined} append
   * @return {String}
   */
  var getIssueUrl = function(num, append) {
    return sprintf('/rest/api/2/issue/%s%s', num, append || '');
  };

}

util.inherits(JiraRepository, TrackerRepository);

module.exports = JiraRepository;
