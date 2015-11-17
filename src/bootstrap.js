'use strict';

var blessed                  = require('blessed');
var Promise                  = require('bluebird');
var Container                = require('./services/container');
var Cache                    = require('./services/cache');
var Storage                  = require('./services/storage');
var Config                   = require('./services/config');
var IssueTracker             = require('./domain/model/tracker');
var ReportManager            = require('./domain/model/reportManager');
var JiraClient               = require('./domain/backend/jira/client');
var JiraRepository           = require('./domain/backend/jira/repository');
var JiraNormalizer           = require('./domain/backend/jira/normalizer');
var JiraMetadata             = require('./domain/backend/jira/metadata');
var Application              = require('./app/main');
var BlessedApplication       = require('./ui/app');
var keys                     = require('./ui/keys');
var help                     = require('./ui/help');
var Browser                  = require('./ui/browser');
var UserInput                = require('./ui/input');
var YamlFrontMatterFormat    = require('./ui/formats/yaml-front-matter');
var listIssuesController     = require('./ui/controllers/listIssues');
var createIssueController    = require('./ui/controllers/createIssue');
var viewIssueController      = require('./ui/controllers/viewIssue');
var applyChangeSetController = require('./ui/controllers/applyChangeSet');
var issueListView            = require('./ui/views/issueList');
var YamlFrontMatterParser    = require('./util/frontmatter-yaml');

module.exports = function(options) {
  var builders = [];

  /**
   * Main setup flow
   */
  var main = function() {
    var container = new Container();
    builders.forEach(function(build) { build(container); });
    return container;
  };

  /**
   * Registers all of core application services
   */
  builders.push(function setupCoreServices(container) {
    container.registerService('logger', function() {
      return require('../src/services/logger')(options.logLevel);
    });

    container.registerService('config', function() {
      var conf = new Config(options.configFile);
      return conf.initialize().then(function() {
        return conf;
      });
    });

    container.registerService('storage', function() {
      return new Storage(options.cacheFile);
    });

    container.registerService('cache', function(storage) {
      return new Cache(storage, options.clearCache);
    }, ['storage']);
  });

  /**
   * Registers all of the jira services
   */
  builders.push(function setupJira(container) {
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
  });

  /**
   * Registers all of the ui services
   */
  builders.push(function setupUi(container) {
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
      'ui.input',
      function(screen, keys) {
        return new UserInput(screen, keys);
      },
      ['ui.screen', 'ui.keys']
    );

    container.registerService(
      'ui.screen',
      function() {
        return blessed.screen({ input: options.input, ouptut: options.output });
      }
    );

    container.registerService(
      'ui',
      function(screen, app, input, logger, format, keys) {
        return new BlessedApplication(
          screen,
          app,
          input,
          logger,
          format,
          keys,
          function() {
            return container.getMatching(['ui.controller', 'ui.views']);
          }
        );
      },
      ['ui.screen', 'app', 'ui.input', 'logger', 'ui.formats.yaml-frontmatter', 'ui.keys']
    );
  });

  /**
   * Registers all of the controllers
   */
  builders.push(function setupUiControllers(container) {
    container.registerService(
      'ui.controller',
      function(listIssues, createIssue, viewIssue, applyChangeSet) {
        return {
          listIssues: listIssues,
          createIssue: createIssue,
          viewIssue: viewIssue,
          applyChangeSet: applyChangeSet
        };
      },
      [
        'ui.controller.listIssues',
        'ui.controller.createIssue',
        'ui.controller.viewIssue',
        'ui.controller.applyChangeSet'
      ]
    );

    container.registerService(
      'ui.controller.listIssues',
      function(app, ui, keys, tracker) { return listIssuesController(app, ui, keys, tracker); },
      ['app', 'ui', 'ui.keys', 'tracker']
    );

    container.registerService(
      'ui.controller.createIssue',
      function(ui, tracker, logger) { return createIssueController(ui, tracker, logger); },
      ['ui', 'tracker', 'logger']
    );

    container.registerService(
      'ui.controller.viewIssue',
      function(app, ui, tracker, logger) { return viewIssueController(app, ui, tracker, logger); },
      ['app', 'ui', 'tracker', 'logger']
    );

    container.registerService(
      'ui.controller.applyChangeSet',
      function(app, ui, tracker, logger) { return applyChangeSetController(ui, tracker); },
      ['ui', 'tracker']
    );
  });

  /**
   * Registers all of the views
   */
  builders.push(function setupUiViews(container) {

    container.registerService(
      'ui.views',
      function(issueList) {
        return {
          issueList: issueList
        };
      },
      ['ui.views.issueList']
    );

    container.registerService(
      'ui.views.issueList',
      function(app, tracker, input, keys, logger) { return issueListView(app, tracker, input, keys, logger); },
      ['app', 'tracker', 'ui.input', 'ui.keys', 'logger']
    );

  });

  /**
   * Registers all of the domain services
   */
  builders.push(function setupDomainServices(container) {
    container.registerService(
      'app',
      function(config, reportManager) { return new Application(config, reportManager); },
      ['config', 'domain.report-manager']
    );

    container.registerService(
      'domain.report-manager',
      function(storage) { return new ReportManager(storage); },
      ['storage']
    );
  });

  return main();
};
