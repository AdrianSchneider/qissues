'use strict';

var Container                = require('./services/container');
var Cache                    = require('./services/cache');
var Storage                  = require('./services/storage');
var Config                   = require('./services/config');
var keys                     = require('./ui/keys');
var help                     = require('./ui/help');
var Promise                  = require('bluebird');
var Browser                  = require('./ui/browser');
var IssueTracker             = require('./domain/model/tracker');
var ReportManager            = require('./domain/model/reportManager');
var JiraClient               = require('./domain/backend/jira/client');
var JiraRepository           = require('./domain/backend/jira/repository');
var JiraNormalizer           = require('./domain/backend/jira/normalizer');
var JiraMetadata             = require('./domain/backend/jira/metadata');
var YamlFrontMatterParser    = require('./util/frontmatter-yaml');
var YamlFrontMatterFormat    = require('./ui/formats/yaml-front-matter');
var listIssuesController     = require('./ui/controllers/listIssues');
var createIssueController    = require('./ui/controllers/createIssue');
var viewIssueController      = require('./ui/controllers/viewIssue');
var applyChangeSetController = require('./ui/controllers/applyChangeSet');

module.exports = function(configFile, cacheFile) {
  /**
   * Main setup flow
   */
  var main = function() {
    var container = new Container();
    setupCoreServices(container);
    setupJira(container);
    setupUi(container);
    setupDomainServices(container);
    return container;
  };

  /**
   * Registers all of core application services
   */
  var setupCoreServices = function(container) {
    container.registerService('config', function() {
      var conf = new Config(configFile);
      return conf.initialize().then(function() {
        return conf;
      });
    });

    container.registerService('storage', function() {
      return new Storage(cacheFile);
    });

    container.registerService('cache', function(storage) {
      return new Cache(storage);
    }, ['storage']);
  };

  /**
   * Registers all of the jira services
   */
  var setupJira = function(container) {
    var config = container.get('config');

    container.registerService(
      'tracker.jira.client',
      function(config) {
        return new JiraClient(config.get('domain'), config.get('username'), config.get('password'));
      },
      ['config']
    );

    container.registerService(
      'tracker.jira.metadata',
      function(client, cache) { return new JiraMetadata(client, cache); },
      ['tracker.jira.client', 'cache']
    );

    container.registerService(
      'tracker.jira.normalizer',
      function(metadata, config) { return new JiraNormalizer(metadata, config); },
      ['tracker.jira.metadata', 'config']
    );

    container.registerService(
      'tracker.jira.repository',
      function(client, cache, normalizer) { return new JiraRepository(client, cache, normalizer); },
      ['tracker.jira.client', 'cache', 'tracker.jira.normalizer']
    );

    container.registerService(
      'tracker.jira',
      function(normalizer, repository, metadata) { return new IssueTracker(normalizer, repository, metadata); },
      ['tracker.jira.normalizer', 'tracker.jira.repository', 'tracker.jira.metadata']
    );

    // TODO alias
    container.registerService(
      'tracker',
      function(tracker) { return Promise.resolve(tracker); },
      ['tracker.jira']
    );
  };

  /**
   * Registers all of the ui services
   */
  var setupUi = function(container) {
    container.registerService(
      'util.yaml-frontmatter',
      function() { return new YamlFrontMatterParser(require('js-yaml')); }
    );

    container.registerService(
      'ui.formats.yaml-frontmatter',
      function(yamlFrontMatter) { return new YamlFrontMatterFormat(yamlFrontMatter, require('js-yaml')); },
      ['util.yaml-frontmatter']
    );

    container.registerService(
      'ui.keys',
      function(config) { return keys(config); },
      ['config']
    );

    container.registerService(
      'ui.help',
      function() { return help('less', ['-c'], 'docs/help.txt'); }
    );

    container.registerService(
      'ui.browser',
      function(config) { return new Browser(config.get('browser', null)); },
      ['config']
    );

    container.registerService(
      'ui.controller.listIssues',
      function(app, ui, tracker) { return listIssuesController(app, ui, tracker); },
      ['app', 'ui', 'tracker']
    );

    container.registerService(
      'ui.controller.createIssue',
      function(ui, tracker, logger) { return createIssueController(ui, tracker, logger); },
      ['ui', 'tracker', 'logger']
    );

    container.registerService(
      'ui.controller.viewIssue',
      function(app, ui, tracker, logger) { return viewIssueController(app, ui, tracker, logger); },
      ['ui', 'tracker', 'logger']
    );

    container.registerService(
      'ui.controller.applyChangeSet',
      function(app, ui, tracker, logger) { return applyChangeSetController(ui, tracker); },
      ['ui', 'tracker']
    );
  };

  /**
   * Registers all of the domain services
   */
  var setupDomainServices = function(container) {
    container.registerService(
      'domain.report-manager',
      function(storage) { return new ReportManager(storage); },
      ['storage']
    );
  };

  return main();
};
