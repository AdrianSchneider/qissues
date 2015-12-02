'use strict';

var _            = require('underscore');
var Sequencer    = require('../events/sequencer');
var f            = require('../../util/f');
var ChangeSet    = require('../../domain/model/changeSet');
var Cancellation = require('../../domain/errors/cancellation');

module.exports = function(view, keys, input, metadata) {
  var construct = function() {
    (new Sequencer(view, keys.leader))
      .on(keys['change.title'], changeText('Title', 'title'))
      .on(keys['change.assignee'], changeList(
        f.prepend(metadata.getUsers, 'Unassigned'),
        'Assignee',
        'assignee'
      ))
      .on(keys['change.status'], changeList(
        metadata.getStatuses,
        'Status',
        'status'
      ))
      .on(keys['change.sprint'], changeList(
        f.prepend(metadata.getSprints, 'Backlog'),
        'Sprint',
        'sprint'
      ));
  };

  var changeText = function(message, field) {
    return function() {
      input.ask(message)
        .then(emitChanged('title'))
        .catch(Cancellation, _.noop);
    };
  };

  var changeList = function(getOptions, message, field) {
    return function() {
      input.selectFromCallableList(message, getOptions)
        .then(emitChanged(field))
        .catch(Cancellation, _.noop);
    };
  };

  var emitChanged = function(field) {
    return function(content) {
      view.emit('changeset', ChangeSet.create()
        .addIssues(view.getSelectedIssues())
        .addChange(field, content)
        .get()
      );
    };
  };

  construct();

};
