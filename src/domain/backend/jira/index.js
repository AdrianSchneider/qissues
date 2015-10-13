'use strict';

var Client         = require('./client');
var sprintf        = require('util').format;
var JiraRepository = require('./repository');
var JiraMapping = null;

module.exports = function JiraBackend(container) {
  var config = container.get('config');
  var cache = container.get('cache');
  var client = new Client(config.domain, config.username, config.password);
  var mapping = new JiraMapping();

  this.repository = new JiraRepository(client, cache, mapping);

  this.query = require('./query')(client, cache);
  this.lookup = require('./lookup')(client, cache);
  this.comment = require('./comment')(client);

  this.createIssue = function(newIssue) {
    throw new Error('not yet');
  };

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

  this.requirements = {
    issue: require('./requirements/issue'),
    //comment: require('./requirements/comment')
  };

  this.mapping = new (require('./mapping'))(
    null,
    container.get('config')
  );
};
