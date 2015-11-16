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
module.exports = function(app, ui, tracker, logger) {
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

    var view = ui.views.single(
      num,
      invalidate,
      repository.lookup(num, invalidate),
      repository.getComments(num, invalidate)
    );

    view.key(ui.keys.back, function() {
      ui.listIssues(null, num);
    });

    view.key(ui.keys.refresh, refreshIssue(num));

    view.key(ui.keys.web, function() {
      app.get('browser').open(
        normalizer.getIssueUrl(num, app.getFilters())
      );
    });

    view.key(ui.keys['issue.comment.inline'], function() {
      ui.input.ask('Comment')
        .then(persistComment(num))
        .then(refreshIssue(num))
        .catch(Cancellation, _.noop);
    });

    view.key(ui.keys['issue.comment.external'], function() {
      ui.input.editExternally('')
        .then(persistComment(num))
        .then(refreshIssue(num))
        .catch(Cancellation, _.noop);
    });
  };

  var refreshIssue = function(num) {
    ui.viewIssue(num, true);
  };

  var persistComment = function(num) {
    return function(text) {
      return repository.create(new NewComment(text, num));
    };
  };

  return main;

};
