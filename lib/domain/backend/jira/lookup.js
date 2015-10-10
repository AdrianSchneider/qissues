'use strict';

var Promise = require('bluebird');
var Issue   = require('../../model/issue');

module.exports = function(client, cache) {
  /**
   * Fetches issues using a query
   *
   * @param {Report} report
   * @param {Boolean} invalidate - bypass cache
   * @return {Promise<Issue>} - promised issue
   */
  return function(num, invalidate) {
    var cacheId = 'lookup:' + num;
    var cached = cache.get(cacheId, invalidate);
    if(cached) return Promise.resolve(cached);

    return client.get('/rest/api/2/issue/' + num)
      .then(function(issue) {
        cache.set(cacheId, issue);
        return new Issue(issue);
      });
  };

};
