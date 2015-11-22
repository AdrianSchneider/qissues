'use strict';

var _                = require("underscore");
var Promise          = require('bluebird');
var f                = require('../util/f');
var canvas           = require('./views/canvas');
var messageWidget    = require('./widgets/message');
var Cancellation     = require('../domain/errors/cancellation');
var ValidationError  = require('../domain/errors/validation');
var MoreInfoRequired  = require('../domain/errors/infoRequired');

/**
 * Main Qissues application
 *
 * @param {blessed.screen} screen
 * @param {Application} application
 */
module.exports = function BlessedApplication(screen, app, tracker, config, input, logger, format, keys, getDeps) {
  var ui = this;
  this.screen = screen;

  /**
   * Starts up the user interface
   *
   * @param {String|null} action
   * @param {String|null} id
   */
  ui.start = function(action, id) {
    logger.debug('Booting up ui');
    ui.canvas = canvas(screen);
    screen.append(ui.canvas);
    screen.render();

    tracker.assertConfigured(config.serialize())
      .catch(MoreInfoRequired, function(e) {
        return ui.capture(e.expectations, {}, '', null).then(config.save);
      })
      .catch(Cancellation, function() {
        return ui.message('Needs config to run.').then(function() { app.exit(1); });
      })
      .then(getDeps)
      .spread(function(controller, views) {
        ui.controller = controller;
        ui.views = views;

        if(!action) action = 'listIssues';
        ui.controller[action](id);

        app.getActiveReport().on('change', function() {
          logger.debug('Changing filters');
          ui.controller.listIssues();
        });

        screen.key(keys.help, _.partial(ui.controller.help, screen));
        screen.key(keys.exit, function() { app.exit(0); });
        screen.key(keys['issue.lookup'], function() {
          input.ask('Open Issue', ui.canvas)
            .then(ui.controller.viewIssue)
            .catch(Cancellation, _.noop);
        });
      });
  };

  /**
   * Capture expectations from the user
   *
   * @param {Expectations} expectations
   * @param {Object} defaults
   * @param {String} draft - last editing attempt
   * @param {Error} error - last error
   */
  this.capture = function(expectations, defaults, draft, error) {
    var data = {};
    return format.seed(expectations, defaults, draft, error)
      .then(input.editExternally)
      .then(f.tee(data, 'content'))
      .then(format.parse)
      .then(expectations.ensureValid)
      .catch(ValidationError, function(e) {
        return ui.capture(expectations, defaults, data.content, e);
      });
  };

  /**
   * Clears the screen and draws a loading indicator
   * @param {String|null} msg
   */
  ui.showLoading = function(msg) {
    logger.trace('#showLoading');
    ui.clearScreen();
    var alert = messageWidget(ui.canvas, msg || 'Loading...', Infinity);
    ui.canvas.append(alert);
    screen.render();
  };

  /**
   * Clears the screen
   */
  ui.clearScreen = function() {
    logger.trace('#clearScreen');
    ui.canvas.children.forEach(function(child) { ui.canvas.remove(child); });
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
      var m = messageWidget(ui.canvas, msg, delay);
      setTimeout(function() { resolve(); }, delay);
    });
  };

};
