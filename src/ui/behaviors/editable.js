'use strict';

var _            = require('underscore');
var Sequencer    = require('../events/sequencer');
var f            = require('../../util/f');
var ChangeSet    = require('../../domain/model/changeSet');
var Cancellation = require('../../domain/errors/cancellation');

module.exports = function(keys, input, metadata) {

  var events = [
    'changeset'
  ];

  /**
   * Sets up listeners on view to allow changes
   *
   * @param {blessed.Node} view
   */
  var register = function(view) {
    Sequencer.attach(view, keys.leader)
      .on(keys['change.title'], changeText(view, 'Title', 'title'))
      .on(keys['change.assignee'], changeList(
        view,
        f.prepend(metadata.getUsers, 'Unassigned'),
        'Assignee',
        'assignee'
      ))
      .on(keys['change.status'], changeList(
        view,
        metadata.getStatuses,
        'Status',
        'status'
      ))
      .on(keys['change.sprint'], changeList(
        view,
        f.prepend(metadata.getSprints, 'Backlog'),
        'Sprint',
        'sprint'
      ));
  };

  /**
   * Prompts the user for text with message, then emits field was changed
   *
   * @param {blessed.Node} view
   * @param {String} message - to show user
   * @param {String} field - to notify change of
   * @return {Function}
   */
  var changeText = function(view, message, field) {
    return function() {
      input.ask(message)
        .then(emitChanged(view, 'title'))
        .catch(Cancellation, _.noop);
    };
  };

  /**
   * Prompts the user for text with message, then emits field was changed
   *
   * @param {blessed.Node} view
   * @param {Function} getOptions - function returning promise of options
   * @param {String} message - to show user
   * @param {String} field - to notify change of
   * @return {Function}
   */
  var changeList = function(view, getOptions, message, field) {
    return function() {
      input.selectFromCallableList(message, getOptions)
        .then(emitChanged(view, field))
        .catch(Cancellation, _.noop);
    };
  };

  /**
   * Notifies the view to change every selected issue for this field
   *
   * @param {blessed.Node} view
   * @param {String} field
   * @return {Function} - accepting changed content
   */
  var emitChanged = function(view, field) {
    return function(content) {
      view.emit('changeset', ChangeSet.create()
        .addIssues(view.getSelectedIssues())
        .addChange(field, content)
        .get()
      );
    };
  };

  return register;

};
