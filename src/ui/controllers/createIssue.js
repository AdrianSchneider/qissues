'use strict';

var Cancellation = require('../../domain/errors/cancellation');

/**
 * Create Issue Controller
 */
module.exports = function(ui, tracker, logger) {
  var repository = tracker.getRepository();
  var normalizer = tracker.getNormalizer();

  /**
   * Creates a new issue using the editor
   *
   * @param {FilterSet|null} filters
   */
  var main = function(filters) {
    ui.showLoading();
    ui.capture(normalizer.getNewIssueRequirements(), filters)
      .then(persistIssue)
      .then(ui.controller.viewIssue)
      .catch(Cancellation, function() {
        ui.message('Cancelled').then(ui.controller.listIssues);
      })
      .catch(Error, function(error) {
        logger.error('Caught error: ' + error.stack);
        ui.message(error.message, 5000).then(ui.controller.listIssues);
      });
  };

  var persistIssue = function(data) {
    return repository.createIssue(normalizer.toNewIssue(data));
  };

  return main;

};
