'use strict';

var Promise = require('bluebird');
var Client  = require('./client');

/**
 * Fetches issues with a query
 *
 * @param {Object} config
 * @param {Cache}  cache
 * @param {Report} report
 * @param {Boolean} force - bypasses cached version
 * @return {Promise<Array>} - promised array of issues
 */
module.exports = function(config, cache, report, force) {
  var client = new Client(config.hostname, config.username, config.password);
  var ttl = config.ttl || [60, 'minutes'];

  var options = {
    qs: {
      jql: report.getFilters().toJql(),
      maxResults: 1000
    }
  };

  var cacheId = 'issues:' + options.qs.jql;
  if(!force) {
    var cached = cache.get(cacheId);
    return Promise.resolve(cached);
  }

  return client.get('/rest/api/2/search', options)
    .then(function(issues) {
      cache.set(cacheId, issues.issues);
      return issues;
    });
};
