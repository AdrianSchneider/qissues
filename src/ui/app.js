'use strict';

var _                = require("underscore");
var Promise          = require('bluebird');
var views            = require('./views');
var UserInput        = require('./input');
var messageWidget    = require('./widgets/message');
var NewComment       = require('../domain/model/newComment');
var Cancellation     = require('../domain/errors/cancellation');
var ValidationError  = require('../domain/errors/validation');
var MoreInfoRequired = require('../domain/errors/infoRequired');

/**
 * Main Qissues application
 *
 * @param {blessed.screen} screen
 * @param {Application} application
 */
module.exports = function BlessedApplication(screen, app) {
  var ui = this;
  this.screen = screen;
  var trackerNormalizer = app.get('tracker').getNormalizer();
  var trackerRepository = app.get('tracker').getRepository();
  var trackerMetadata = app.get('tracker').getMetadata();
  var format = app.get('ui.formats.yaml-frontmatter');
  var logger = app.get('logger');
  var keys = app.get('ui.keys');
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

    if(!action) action = 'listIssues';
    ui[action](id);

    app.getActiveReport().on('change', function() {
      ui.listIssues();
    });

    screen.key(keys.help, function() { showHelp(screen); });
    screen.key(keys.exit, function() { app.exit(0); });
  };


  /**
   * Promises input from expectations in a verify/retry loop
   *
   * @param {Expectations} expectations
   * @param {Object} defaults
   * @param {String} last edit attempt
   * @param {Error} last error
   * @return {Promise<Object>}
   */
  var getExpected = function(expectations, defaults, draft, failure) {
    var data = {};
    return format.seed(expectations, defaults, draft, failure)
      .then(input.editExternally)
      .then(tee(data, 'content'))
      .then(format.parse)
      .then(expectations.ensureValid)
      .catch(ValidationError, function(error) {
        return getExpected(expectations, defaults, data.content, error);
      });
  };

  /**
   * Returns a function which copies its input to data[key] before sending it out again
   *
   * @param {Object} data - object to mutate
   * @param {String} key - key to mutate in object
   * @return {Function} to continue promise chain
   */
  var tee = function(data, key) {
    return function(input) {
      data[key] = input;
      return Promise.resolve(input);
    };
  };

  /**
   * Clears the screen and draws a loading indicator
   * @param {String|null} msg
   */
  ui.showLoading = function(msg) {
    ui.clearScreen();
    messageWidget(screen, msg || 'Loading...', Infinity);
  };

  /**
   * Clears the screen
   */
  ui.clearScreen = function() {
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
  ui.message = function(msg, delay) {
    if(!delay) delay = 1000;
    return new Promise(function(resolve, reject) {
      var m = messageWidget(screen, msg, delay);
      setTimeout(function() { resolve(); }, delay);
    });
  };

};
