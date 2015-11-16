'use strict';

var _            = require('underscore');
var prompt       = require('../widgets/prompt');
var promptList   = require('../widgets/promptList');
var Sequencer    = require('../events/sequencer');
var ChangeSet    = require('../../domain/model/changeSet');
var Cancellation = require('../../domain/errors/cancellation');

module.exports = function(view, keys, input, metadata) {
  var sequencer = new Sequencer(view, keys.leader);

  sequencer.on(keys['change.title'], function() {
    input.ask('Title')
      .then(emitChanged('title'))
      .catch(Cancellation, _.noop);
  });

  sequencer.on(keys['change.assignee'], function() {
    metadata.getUsers()
      .then(prepend('Unassigned'))
      .then(input.selectFromListWith('Asignee'))
      .then(emitChanged('assignee'))
      .catch(Cancellation, _.noop);
  });

  sequencer.on(keys['change.status'], function() {
    metadata.getStatuses()
      .then(input.selectFromListWith('Status'))
      // TODO filter by statuses in this project
      .then(emitChanged('status'))
      .catch(Cancellation, _.noop);
  });

  sequencer.on(keys['change.sprint'], function() {
    metadata.getSprints()
      .then(prepend('Backlog'))
      .then(input.selectFromListWith('Sprint'))
      .then(emitChanged('sprint'))
      .catch(Cancellation, _.noop);
  });

  /**
   * Returns a function to handle emitting changes
   *
   * @param {String} field
   * @return {Function} accepting content, emitting changeset
   */
  var emitChanged = function(field) {
    return function(content) {
      view.emit('changeset', ChangeSet.create()
        .addIssues(view.getSelectedIssues())
        .addChange(field, content)
        .get()
      );
    };
  };

  /**
   * Adds an option before other incoming options
   *
   * @param {String} option - to prepend
   * @return {Function} accepting array of options
   */
  var prepend = function(option) {
    return function(options) {
      return [option].concat(options);
    };
  };

};
