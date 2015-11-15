'use strict';

var _               = require("underscore");
var Promise         = require('bluebird');
var sprintf         = require('util').format;
var views           = require('./views');
var UserInput       = require('./input');
var messageWidget   = require('./widgets/message');
var NewIssue        = require('../domain/model/newIssue');
var NewComment      = require('../domain/model/newComment');
var Cancellation    = require('../errors/cancellation');
var ValidationError = require('../errors/validation');

/**
 * Main Qissues application
 *
 * @param {blessed.screen} screen
 * @param {Application} application
 */
module.exports = function BlessedApplication(screen, app, logger) {
  var ui = this;
  var format = app.get('ui.formats.yaml-frontmatter');
  var trackerNormalizer;
  var trackerRepository;
  var trackerMetadata;
  var keys;
  var showHelp = app.get('ui.help');
  var input = new UserInput(screen, keys);

  /**
   * Starts up the user interface
   *
   * @param {String|null} action
   * @param {String|null} id
   */
  ui.start = function(action, id) {
    logger.debug('Booting up ui');

    app.getMatching(['tracker', 'ui.keys']).spread(function(tracker, keyConfig) {
      keys = keyConfig;
      trackerNormalizer = tracker.getNormalizer();
      trackerRepository = tracker.getRepository();
      trackerMetadata   = tracker.getMetadata();

      if(!action) action = 'listIssues';
      ui[action](id);

      app.getActiveReport().on('change', function() {
        ui.listIssues();
      });

      screen.key(keys.help, function() { showHelp(screen); });
      screen.key(keys.exit, function() { app.exit(0); });
    });
  };


  /**
   * Lists all of the issues
   *
   * @param {Boolean} invalidate - skip cache
   * @param {String|null} focus - jumps to matching line
   */
  ui.listIssues = function(invalidate, focus) {
    logger.info('Loading issues');
    showLoading(invalidate ? 'Refreshing...' : 'Loading...');

    var list = views.issueList(screen, app,{
      normalizer: trackerNormalizer,
      metadata: trackerMetadata,
      logger: logger,
      focus: focus || null,
      keys: keys,
      data: trackerRepository.query(app.getActiveReport(), !!invalidate)
    });

    list.on('select', function(num) {
      ui.viewIssue(list.getSelected());
    });

    list.key(keys['issue.lookup'], function() {
      input.ask('Open Issue', screen).then(ui.viewIssue);
    });

    list.key(keys['issue.create.contextual'], function() {
      ui.createIssue(app.getFilters().toValues());
    });
    list.key(keys['issue.create'], function() {
      ui.createIssue();
    });

    list.key(keys.refresh, function() {
      ui.listIssues(true, list.getSelected());
    });

    list.key(keys.web, function() {
      app.get('browser').open(trackerNormalizer.getQueryUrl(app.getFilters()));
    });

  };

  /**
   * View a single issue
   *
   * @param {String} num - issue number
   * @param {Boolean} invalidate
   */
  ui.viewIssue = function(num, invalidate) {
    logger.info('Viewing issue ' + num);

    clearScreen();
    showLoading(invalidate ? 'Refreshing...' : 'Loading ' + num + '...');
    var view = views.single(
      screen,
      app,
      trackerRepository.lookup(num, invalidate),
      trackerRepository.getComments(num, invalidate)
    );

    view.key(keys.back, function() {
      ui.listIssues(null, num);
    });

    view.key(keys.refresh, refreshIssue(num));

    view.key(keys.web, function() {
      app.get('browser').open(trackerNormalizer.getIssueUrl(num, app.getFilters()));
    });

    view.key(keys['issue.comment.inline'], function() {
      input.ask('Comment')
        .then(postComment(num))
        .then(refreshIssue(num))
        .catch(Cancellation, _.noop);
    });

    view.key(keys['issue.comment.external'], function() {
      input.editExternally('')
        .then(postComment(num))
        .then(refreshIssue(num))
        .catch(Cancellation, _.noop);
    });
  };

  /**
   * Returns a function that promises the creation of a new comment from text
   *
   * @param {String} num - issue number
   * @return {Function}
   */
  var postComment = function(num) {
    return function(text) {
      return trackerRepository.create(new NewComment(text, num));
    };
  };

  /**
   * Returns a function that refreshes the UI for a given issue number
   * @param {String} num - issue number
   * @return {Function}
   */
  var refreshIssue = function(num) {
    return function() {
      ui.viewIssue(num, true);
    };
  };

  /**
   * Creates a new issue interactively
   *
   * @param {FilterSet|null} filters
   * @param {String|null} draft - last edit attempt
   */
  ui.createIssue = function(filters, draft, failure) {
    logger.info('Creating new issue' + (draft ? ' with previous content' : ''));

    ui.capture(trackerNormalizer.getNewIssueRequirements(), filters, draft, failure)
      .then(createIssue)
      .then(ui.viewIssue)
      .catch(Cancellation, function() {
        message('Cancelled').then(ui.listIssues);
      })
      .catch(Error, function(error) {
        logger.error('Caught error: ' + error.toString());
        message(error.message, 5000).then(ui.listIssues);
      });
  };

  this.capture = function(expectations, defaults, draft, error) {
    showLoading();

    var content;
    return format.seed(expectations, defaults, draft, error)
      .then(input.editExternally)
      .then(function(input) { content = input;  return content; })
      .then(format.parse)
      .then(expectations.ensureValid)
      .catch(ValidationError, function(e) {
        return ui.capture(expectations, content, e);
      });
  };

  /**
   * Creates a new issue using the tracker for mapping
   *
   * @param {Object} data
   * @return {Promise<Issue>}
   */
  var createIssue = function(data) {
    return trackerRepository.createIssue(trackerNormalizer.toNewIssue(data));
  };

  /**
   * Clears the screen and draws a loading indicator
   * @param {String|null} msg
   */
  var showLoading = function(msg) {
    clearScreen();
    messageWidget(screen, msg || 'Loading...', Infinity);
  };

  /**
   * Clears the screen
   */
  var clearScreen = function() {
    screen.children.forEach(function(child) { screen.remove(child); });
    screen.render();
  };

  /**
   * Shows a thenable message
   *
   * @param {String} msg
   * @param {Number} delay
   * @return {Promise}
   */
  var message = function(msg, delay) {
    if(!delay) delay = 1000;
    return new Promise(function(resolve, reject) {
      var m = messageWidget(screen, msg, delay);
      setTimeout(function() { resolve(); }, delay);
    });
  };

};
