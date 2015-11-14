'use strict';

var util              = require('util');
var Promise           = require('bluebird');
var TrackerRepository = require('../../model/trackerRepository');

/**
 * Repository for interacting with Jira data
 *
 * @param {JiraHttpClient} client
 * @param {Cache} cache
 * @param {JiraNormalizer} normalizer
 */
function JiraRepository(client, cache, normalizer) {
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

    return client.get('/rest/api/2/issue/' + num)
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
    var options = { qs: { maxResults: 500, jql: report.getFilters().toJql() } };

    if(this.logger) this.logger.debug('JQL = ' + options.qs.jql);

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

    return client.get('/rest/api/2/issue/' + num + '/comment')
      .then(cache.setThenable(cacheId))
      .then(normalizer.toCommentsCollection);
  };

}

util.inherits(JiraRepository, TrackerRepository);

module.exports = JiraRepository;
