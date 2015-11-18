'use strict';

var _            = require('underscore');
var NewComment   = require('../../domain/model/newComment');
var Cancellation = require('../../domain/errors/cancellation');

/**
 * View Issue Controller
 *
 * Responsible for prepping a view single view, and
 * coordinating it with the rest of the app
 */
module.exports = function(app, ui, keys, tracker, logger) {
  var repository = tracker.getRepository();
  var normalizer = tracker.getNormalizer();

  /**
   * View a specific issue
   *
   * @param {String} num
   * @param {Boolean} invalidate - force cache clear
   */
  var main = function(num, invalidate) {
    logger.info('Viewing issue ' + num);

    ui.clearScreen();
    ui.showLoading(invalidate ? 'Refreshing...' : 'Loading ' + num + '...');

    var view = ui.views.singleIssue(
      ui.canvas,
      repository.lookup(num, invalidate),
      repository.getComments(num, invalidate)
    );

    view.key(keys.back, function() {
      ui.controller.listIssues(null, num);
    });

    view.key(keys.refresh, refreshIssue(num));

    view.key(keys.web, function() {
      app.get('browser').open(
        normalizer.getIssueUrl(num, app.getFilters())
      );
    });

    view.key(keys['issue.comment.inline'], function() {
      ui.input.ask('Comment')
        .then(persistComment(num))
        .then(refreshIssue(num))
        .catch(Cancellation, _.noop);
    });

    view.key(keys['issue.comment.external'], function() {
      ui.input.editExternally('')
        .then(persistComment(num))
        .then(refreshIssue(num))
        .catch(Cancellation, _.noop);
    });
  };

  var refreshIssue = function(num) {
    return function() {
      ui.controller.viewIssue(num, true);
    };
  };

  var persistComment = function(num) {
    return function(text) {
      return repository.create(new NewComment(text, num));
    };
  };

  return main;

};
