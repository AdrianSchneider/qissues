'use strict';

var Promise         = require('bluebird');
var sprintf         = require('util').format;
var views           = require('./views');
var messageWidget   = require('./widgets/message');
var promptWidget    = require('./widgets/prompt');
var NewIssue        = require('../domain/model/newIssue');
var NewComment      = require('../domain/model/newComment');
var ValidationError = require('../errors/validation');
var yamlFrontMatter = new (require('./formats/yaml-front-matter'))(
  new (require('../util/frontmatter-yaml'))(
    require('js-yaml')
  ),
  require('js-yaml')
);

/**
 * Main Qissues application
 *
 * @param {blessed.screen} screen
 * @param {Application} application
 */
module.exports = function BlessedApplication(screen, app) {
  var ui = this;
  var tracker = app.get('tracker');
  var trackerNormalizer = app.get('tracker').getNormalizer();
  var trackerRepository = app.get('tracker').getRepository();

  var format = yamlFrontMatter;

  /**
   * Starts up the user interface
   *
   * @param {String|null} action
   * @param {String|null} id
   */
  ui.start = function(action, id) {
    if(!action) action = 'listIssues';
    ui[action](id);

    app.getActiveReport().on('change', function() {
      ui.listIssues();
    });

    setupKeyboard();
  };


  /**
   * Sets up the global keyboard handlers
   */
  var setupKeyboard = function() {
    screen.key('C-c', function(ch, key) {
      app.exit();
    });

    screen.key('?', function() {
      var opt = {
        stdio: 'inherit',
        env: process.env,
      };
      screen.exec('less', ['-c', 'docs/help.txt'], opt, function() {});
      screen.render();
    });

    screen.key('m', app.reloadMetadata);
  };

  /**
   * Lists all of the issues
   *
   * @param {Boolean} invalidate - skip cache
   * @param {String|null} focus - jumps to matching line
   */
  ui.listIssues = function(invalidate, focus) {
    showLoading(invalidate ? 'Refreshing...' : 'Loading...');

    var list = views.issueList(
      screen,
      app,
      focus,
      trackerRepository.query(app.getActiveReport(), !!invalidate)
    );

    list.on('select', function(num) {
      ui.viewIssue(list.getSelected());
    });

    list.key('S-i', function() {
      prompt('Open Issue', screen).then(ui.viewIssue);
    });

    list.key('c', function() {
      ui.createIssue(app.report.getFilters());
    });
    list.key('S-c', function() {
      ui.createIssue();
    });

    list.key('C-r', function() {
      ui.listIssues(true, list.getSelected());
    });

    list.key('w', function() {
      app.get('browser').open(trackerNormalizer.getIssuesUrl(app.getActiveReport()));
    });

  };

  /**
   * View a single issue
   *
   * @param {String} num - issue number
   * @param {Boolean} invalidate
   */
  ui.viewIssue = function(num, invalidate) {
    clearScreen();
    showLoading(invalidate ? 'Refreshing...' : 'Loading ' + num + '...');
    var view = views.single(screen, app, trackerRepository.lookup(num, invalidate));

    view.key(['escape', 'h'], function() {
      ui.listIssues(null, num);
    });

    view.key('C-r', refreshIssue(num));

    view.key('w', function() {
      app.get('browser').open(trackerNormalizer.getIssueUrl(num, app.getActiveReport()));
    });

    view.key('c', function() {
      prompt('Comment')
        .then(postComment(num))
        .then(refreshIssue(num))
        .catch(ValidationError, function(){});
    });

    view.key('S-c', function() {
      editExternally('')
        .then(postComment(num))
        .then(refreshIssue(num))
        .catch(ValidationError, function(){});
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
  ui.createIssue = function(filters, draft) {
    showLoading();

    var template = format.seed(trackerNormalizer.getNewIssueRequirements());
    var content = draft || template;

    editExternally(content, screen)
      .then(function(input) {
        content = input;
        return format.parse(input);
      })
      .catch(ValidationError, function() {
        return message('Cancelled').then(ui.listIssues);
      })
      .then(createIssue)
      .then(function(issue) { return issue.id; })
      .then(ui.viewIssue)
      .catch(ValidationError, function(error) {
        if(content === template) {
          return message('Cancelled').then(ui.listIssues);
        }
        ui.createIssue(filters, prependErrorToContent(error, content));
      });
  };

  var prependErrorToContent = function(error, content) {
    var pos = content.indexOf('---');
    return sprintf(
      '# Error: %s\n%s',
      error.message,
      typeof pos !== 'undefined' ? content.substr(pos) : content
    );
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
   * Returns the promise of text from the user input
   *
   * @param {String} text to prompt user with
   * @return {Promise<String>} user input
   */
  var prompt = function(text) {
    return Promise.promisify(promptWidget)(text, screen);
  };

  /**
   * Returns the promise of text from externally edited text
   *
   * @param {String} initial
   * @return {Promise<String>} user input
   */
  var editExternally = function(initial) {
    // promisify fails
    return new Promise(function(resolve, reject) {
      screen.readEditor({ value: initial }, function(err, data) {
        if (err) return reject(err);
        return resolve(data);
      });
    });
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
