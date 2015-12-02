'use strict';

var blessed                  = require('blessed');
var Promise                  = require('bluebird');
var Container                = require('./app/services/container');
var Cache                    = require('./app/services/cache');
var Storage                  = require('./app/services/storage/disk');
var Config                   = require('./app/services/config');
var IssueTracker             = require('./domain/model/tracker');
var ReportManager            = require('./domain/model/reportManager');
var JiraClient               = require('./domain/backend/jira/client');
var JiraRepository           = require('./domain/backend/jira/repository');
var JiraNormalizer           = require('./domain/backend/jira/normalizer');
var JiraMetadata             = require('./domain/backend/jira/metadata');
var jiraExpectations         = require('./domain/backend/jira/requirements/config');
var Application              = require('./app/main');
var BlessedApplication       = require('./ui/app');
var keys                     = require('./ui/keys');
var Browser                  = require('./ui/browser');
var UserInput                = require('./ui/input');
var YamlFrontMatterFormat    = require('./ui/formats/yaml-front-matter');
var listIssuesController     = require('./ui/controllers/listIssues');
var createIssueController    = require('./ui/controllers/createIssue');
var viewIssueController      = require('./ui/controllers/viewIssue');
var applyChangeSetController = require('./ui/controllers/applyChangeSet');
var helpController           = require('./ui/controllers/help');
var issueListView            = require('./ui/views/issueList');
var singleIssueView          = require('./ui/views/single');
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
      return require('../src/app/services/logger')(options.logLevel);
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
      function(config, logger) {
        return new JiraClient(config, logger);
      },
      ['config', 'logger']
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
      function(client, cache, normalizer, metadata, logger) { return new JiraRepository(client, cache, normalizer, metadata, logger); },
      ['tracker.jira.client', 'cache', 'tracker.jira.normalizer', 'tracker.jira.metadata', 'logger']
    );

    container.registerService(
      'tracker.jira',
      function(normalizer, repository, metadata) { return new IssueTracker(normalizer, repository, metadata, jiraExpectations); },
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
      'ui.browser',
      function(config) { return new Browser(config.get('browser', null)); },
      ['config']
    );

    container.registerService(
      'ui.input',
      function(screen, keys, logger) {
        return new UserInput(screen, keys, logger);
      },
      ['ui.screen', 'ui.keys', 'logger']
    );

    container.registerService(
      'ui.screen',
      function() {
        return blessed.screen({ input: options.input, ouptut: options.output });
      }
    );

    container.registerService(
      'ui',
      function(screen, app, tracker, config, input, logger, format, keys) {
        return new BlessedApplication(
          screen,
          app,
          tracker,
          config,
          input,
          logger,
          format,
          keys,
          function() {
            return container.getMatching(['ui.controller', 'ui.views']);
          }
        );
      },
      ['ui.screen', 'app', 'tracker', 'config', 'ui.input', 'logger', 'ui.formats.yaml-frontmatter', 'ui.keys']
    );
  });

  /**
   * Registers all of the controllers
   */
  builders.push(function setupUiControllers(container) {
    container.registerService(
      'ui.controller',
      function(listIssues, createIssue, viewIssue, applyChangeSet, help) {
        return {
          listIssues: listIssues,
          createIssue: createIssue,
          viewIssue: viewIssue,
          applyChangeSet: applyChangeSet,
          help: help
        };
      },
      [
        'ui.controller.listIssues',
        'ui.controller.createIssue',
        'ui.controller.viewIssue',
        'ui.controller.applyChangeSet',
        'ui.controller.help'
      ]
    );

    container.registerService(
      'ui.controller.listIssues',
      function(app, ui, input, keys, tracker, browser) {
        return listIssuesController(app, ui, input, keys, tracker, browser);
      },
      ['app', 'ui', 'ui.input', 'ui.keys', 'tracker', 'ui.browser']
    );

    container.registerService(
      'ui.controller.viewIssue',
      function(app, ui, input, keys, tracker, logger, browser) {
        return viewIssueController(app, ui, input, keys, tracker, logger, browser);
      },
      ['app', 'ui', 'ui.input', 'ui.keys', 'tracker', 'logger', 'ui.browser']
    );

    container.registerService(
      'ui.controller.createIssue',
      function(ui, tracker, logger) { return createIssueController(ui, tracker, logger); },
      ['ui', 'tracker', 'logger']
    );

    container.registerService(
      'ui.controller.applyChangeSet',
      function(ui, tracker) { return applyChangeSetController(ui, tracker); },
      ['ui', 'tracker']
    );

    container.registerService(
      'ui.controller.help',
      function() { return helpController('less', ['-c'], 'docs/help.txt'); }
    );

  });

  /**
   * Registers all of the views
   */
  builders.push(function setupUiViews(container) {

    container.registerService(
      'ui.views',
      function(issueList, singleIssue) {
        return {
          issueList: issueList,
          singleIssue: singleIssue
        };
      },
      ['ui.views.issueList', 'ui.views.singleIssue']
    );

    container.registerService(
      'ui.views.issueList',
      function(app, tracker, input, keys, logger) { return issueListView(app, tracker, input, keys, logger); },
      ['app', 'tracker', 'ui.input', 'ui.keys', 'logger']
    );

    container.registerService(
      'ui.views.singleIssue',
      function(app, keys, input, tracker, logger) {
        return singleIssueView(app, keys, input, tracker.getMetadata(), logger);
      },
      ['app', 'ui.keys', 'ui.input', 'tracker', 'logger']
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
