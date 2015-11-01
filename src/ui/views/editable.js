'use strict';

var _            = require('underscore');
var prompt       = require('../widgets/prompt');
var promptList   = require('../widgets/promptList');
var Sequencer    = require('../events/sequencer');
var Cancellation = require('../../errors/cancellation');

module.exports = function(view, keys, input) {
  var sequencer = new Sequencer(view, keys.leader);
  var metadata;

  sequencer.on(keys['change.title'], function() {
    input.ask('Title')
      .then(emitChanged('title'))
      .catch(Cancellation, _.noop);
  });

  sequencer.on(keys['change.assignee'], function() {
    metadata.fetchUsers()
      .then(prepend('Unassigned'))
      .then(input.selectFromListWith('Asignee'))
      .then(emitChanged('assignee'))
      .catch(Cancellation, _.noop);
  });

  sequencer.on(keys['change.status'], function() {
    metadata.fetchStatuses()
      .then(input.selectFromListWith('Status'))
      // TODO filter by statuses in this project
      .then(emitChanged('status'))
      .catch(Cancellation, _.noop);
  });

  sequencer.on(keys['change.sprint'], function() {
    metadata.fetchSprints()
      .then(prepend('Backlog'))
      .then(input.selectFromListWith('Sprint'))
      .then(emitChanged('sprint'))
      .catch(Cancellation, _.noop);
  });

  var emitChanged = function(field) {
    return function(content) {
      var changes = {};
      changes[field] = content;
      view.emit('issue.change', { issue: view.getIssue().key, changes: changes });
    };
  };

  var prepend = function(option) {
    return function(options) {
      return [option].concat(options);
    };
  };

};
