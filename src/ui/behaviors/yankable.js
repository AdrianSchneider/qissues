'use strict';

var Promise   = require('bluebird');
var Sequencer = require('../events/sequencer');

module.exports = function(keys, clipboard) {

  /**
   * Sets up listeners for yanking text from a view
   *
   * @param {blessed.Node}
   */
  var register = function(view) {
    Sequencer.attach(view, keys.leader)
      .on(keys['yank.id'],    yank(view, 'id'))
      .on(keys['yank.title'], yank(view, 'title'))
      .on(keys['yank.body'],  yank(view, 'body'))
    ;
  };

  /**
   * Copies the view's selected issues $field to clipboard
   * If multiple are selected, they are delimited with newlines
   *
   * @param {blessed.Node} view
   * @param {String} field
   * @return {Function}
   */
  var yank = function(view, field) {
    return function() {
      var issues = view.getIssues();
      if (!issues.length) return;

      clipboard.copy(issues.getField(field).join('\n'))
        .then(view.clearSelection);
    };
  };

  /**
   * Fetches a dynamic field for an issue
   *
   * @param {String} field
   * @return {Function} map function for issue
   */
  var getField = function(field) {
    return function(issue) {
      return issue.get(field);
    };
  };

  return register;

};
