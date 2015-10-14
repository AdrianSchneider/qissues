'use strict';

var Container      = require('./services/container');
var Cache          = require('./services/cache');
var Storage        = require('./services/storage');
var Browser        = require('./ui/browser');
var IssueTracker   = require('./domain/model/tracker');
var JiraClient     = require('./domain/backend/jira/client');
var JiraRepository = require('./domain/backend/jira/repository');
var JiraNormalizer = require('./domain/backend/jira/normalizer');
var JiraMetadata   = require('./domain/backend/jira/metadata');

module.exports = function(configFile) {
  var main = function() {
    var container = new Container();
    setupCoreServices(container);
    setupJira(container);
    return container;
  };

  var setupCoreServices = function(container) {
    var config = require(configFile);
    container.set('config', config);
    container.set('storage', new Storage(configFile));
    container.set('cache', new Cache(container.get('storage')));
    container.set('browser', new Browser(config.browser));
  };

  var setupJira = function(container) {
    var config = container.get('config');

    container.set('tracker.jira.client', new JiraClient(
      config.domain,
      config.username,
      config.password
    ));

    container.set('tracker.jira.metadata', new JiraMetadata(
      container.get('tracker.jira.client'),
      container.get('cache'),
      config.project
    ));

    container.set('tracker.jira.normalizer', new JiraNormalizer(
      container.get('tracker.jira.metadata'),
      container.get('config')
    ));

    container.set('tracker.jira.repository', new JiraRepository(
      container.get('tracker.jira.client'),
      container.get('cache'),
      container.get('tracker.jira.normalizer')
    ));

    container.set('tracker.jira', new IssueTracker(
      container.get('tracker.jira.normalizer'),
      container.get('tracker.jira.repository')
    ));

    container.set('tracker', container.get('tracker.jira'));
  };

  return main();
};
