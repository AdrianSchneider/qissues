'use strict';

var Client = require('./client');
var sprintf = require('util').format;

module.exports = function JiraBackend(container) {
  var config = container.get('config');
  var cache = container.get('cache');
  var client = new Client(config.domain, config.username, config.password);

  this.query = require('./query')(client, cache);
  this.lookup = require('./lookup')(client, cache);


  this.getIssueUrl = function(issueNum, report) {
    return sprintf(
      'https://%s/browse/%s?jql=%s',
      config.hostname,
      issueNum,
      encodeURIComponent(report.getFilters().toJql())
    );
  };

  this.getIssuesUrl = function(issue, report) {
    return sprintf(
      'https://%s/issues/?jql=%s',
      config.hostname,
      encodeURIComponent(report.getFilters().toJql())
    );
  };
};
