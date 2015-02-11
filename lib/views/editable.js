var _          = require('underscore');
var prompt     = require('../widgets/prompt');
var promptList = require('../widgets/promptList');
var Sequencer  = require('../events/sequencer');

module.exports = function(view, app) {
  var sequencer = new Sequencer(view);

  sequencer.on('ct', function() {
    prompt('Title', view.screen, function(err, title) {
      if(title) view.emit('issue.change', { 
        issue: view.getIssue().key,
        changes: { title: title }
      });
    });
  });

  sequencer.on('ca', function() {
    promptList(
      'Assignee', 
      ['Unassigned'].concat(_.pluck(app.metadata.users, 'name')),
      view.screen, 
      function(err, assignee) {
        if(assignee) view.emit('issue.change', { 
          issue: view.getIssue().key,
          changes: { assignee: assignee == 'Unassigned' ? '' : assignee  }
        });
      }
    );
  });

  sequencer.on('cs', function() {
    var project = _.find(app.metadata.projects, function(project) {
      return project.key == view.getIssue().fields.project.key;
    });

    promptList(
      'Status', 
      _.pluck(project.statuses, 'name'),
      view.screen, 
      function(err, status) {
        if(status) view.emit('issue.change', { 
          issue: view.getIssue().key,
          changes: { status: status }
        });
      }
    );
  });

  sequencer.on('cS', function() {
    promptList(
      'Sprint',
      ['Backlog'].concat(_.pluck(app.metadata.sprints, 'name')),
      view.screen,
      function(err, sprint) {
        if(sprint) view.emit('issue.change', {
          issue: view.getIssue().key,
          changes: { sprint: sprint }
        });
      }
    );
  });
};
