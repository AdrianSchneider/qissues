'use strict';

var Promise = require('bluebird');
var Issue   = require('../../model/issue');

module.exports = function(client, cache) {
  /**
   * Lookup specific issue
   *
   * @param {Report} report
   * @param {Boolean} invalidate - bypass cache
   * @return {Promise<Issue>} - promised issue
   */
  var main = function(num, invalidate) {
    var cacheId = 'lookup:' + num;
    var cached = cache.get(cacheId, invalidate);
    if (cached) return Promise.resolve(toIssue(cached));

    return client.get('/rest/api/2/issue/' + num)
      .then(cache.setThenable(cacheId))
      .then(toIssue);
  };

  /**
   * Converts the response to an Issue
   *
   * @param {Object} response
   * @return {Issue}
   */
  var toIssue = function(response) {
    return new Issue(response);
  };

  return main;

};
