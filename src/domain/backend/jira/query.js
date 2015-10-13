'use strict';

var Promise          = require('bluebird');
var Client           = require('./client');
var Issue            = require('../../model/issue');
var IssuesCollection = require('../../model/issues');

module.exports = function(client, cache) {
  /**
   * Fetches issues using a query
   *
   * @param {Report} report
   * @param {Boolean} invalidate - bypass cache
   * @return {Promise<IssuesCollection>} - promised array of issues
   */
  var main = function(report, invalidate) {
    var options = { qs: { maxResults: 10, jql: report.getFilters().toJql() } };

    var cacheId = 'issues:' + options.qs.jql;
    var cached = cache.get(cacheId, invalidate);
    if (cached) return Promise.resolve(toCollection(cached));

    return client.get('/rest/api/2/search', options)
      .then(cache.setThenable(cacheId))
      .then(toCollection);
  };

  /**
   * Converts the response to an IssuesCollection
   *
   * @param {Object} response
   * @return {IssuesCollection}
   */
  var toCollection = function(response) {
    return new IssuesCollection(response.issues.map(function(issue) {
      return new Issue(issue);
    }));
  };

  return main;
};
