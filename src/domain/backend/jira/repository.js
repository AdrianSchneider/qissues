'use strict';

var util              = require('util');
var Promise           = require('bluebird');
var TrackerRepository = require('../../model/trackerRepository');

/**
 * Repository for interacting with Jira data
 *
 * @param {JiraHttpClient} client
 * @param {Cache} cache
 * @param {JiraMapping} mapping
 */
function JiraRepository(client, cache, mapping) {
  TrackerRepository.call(this);

  /**
   * Creates a new issue on jira
   *
   * @param {NewIssue} newIssue
   * @return {Promise<Issue>}
   */
  this.create = function(newIssue) {
    return client.post('/', mapping.newIssueToPayload(newIssue))
      .then(mapping.toIssue);
  };

  /**
   * Fetches an issue by its number
   *
   * @param {Report} report
   * @param {Boolean} invalidate - bypass cache
   * @return {Promise<IssuesCollection>} - promised array of issues
   */
  this.lookup = function(num, invalidate) {
    var cacheId = 'lookup:' + num;
    var cached = cache.get(cacheId, invalidate);
    if (cached) return Promise.resolve(mapping.toIssue(cached));

    return client.get('/rest/api/2/issue/' + num)
      .then(cache.setThenable(cacheId))
      .then(mapping.toIssue);
  };

  /**
   * Fetches issues using a query
   *
   * @param {Report} report
   * @param {Boolean} invalidate - bypass cache
   * @return {Promise<IssuesCollection>} - promised array of issues
   */
  this.query = function(report, invalidate) {
    var options = { qs: { maxResults: 10, jql: report.getFilters().toJql() } };

    var cacheId = 'issues:' + options.qs.jql;
    var cached = cache.get(cacheId, invalidate);
    if (cached) return Promise.resolve(mapping.toIssuesCollection(cached));

    return client.get('/rest/api/2/search', options)
      .then(cache.setThenable(cacheId))
      .then(mapping.toIssuesCollection);
  };

}

util.inherits(JiraRepository, TrackerRepository);

module.exports = JiraRepository;
