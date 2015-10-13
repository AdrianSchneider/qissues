'use strict';

var _        = require('underscore');
var blessed  = require('blessed');
var editable = require('./editable');
var sprintf  = require('util').format;

/**
 * Single Issue View
 *
 * @param {blessed.Node} parent
 * @param {Application} app
 * @param {Promise<Issue>} issue
 */
module.exports = function(parent, app, issue) {
  var box = blessed.box({
    parent: parent,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    tags: true,
    keys: true,
    vi: true,
    scrollable: true,
    alwaysScroll: true,
    border: {
      type: 'line',
      fg: 'lightblack'
    }
  });

  issue.then(function(issue) {
    editable(box, app);
    box.setContent(renderIssue(issue));
    box.getIssue = function() {
      return issue;
    };
    parent.append(box);
    box.focus();
    parent.render();
  });


  return box;
};

function renderIssue(issue) {
  return buildHeader(issue) + '\n\n' +
    buildMeta(issue) + '\n\n' +
    buildBody(issue) + '\n\n' +
    buildComments(issue);
}

function buildHeader(issue) {
  return sprintf(
    '{bold}{yellow-fg}%s{/yellow-fg} - %s{/bold}',
    issue.getId(),
    issue.getTitle()
  );
}

function buildMeta(issue) {
  var meta = _.mapObject({
    status      : issue.getStatus(),
    type        : issue.get('type'),
    priority    : issue.get('priority'),
    dateCreated : issue.get('dateCreated'),
    dateUpdated : issue.get('dateCreated'),
    reporter    : issue.get('reporter'),
    assignee    : issue.get('assignee')
  }, String);

  var out = '';

  out += '\t{blue-fg}' + meta.status + '{/blue-fg} ';
    out += meta.type;
  out += getAssigned(meta);
  out += ' ' + meta.priority;
  out += '\n\treported by ' + meta.reporter;
    out += ' on ' + meta.dateCreated;

  return out;

}

function getAssigned(meta) {
  if(!meta.assignee) return 'currently unassigned';
  return 'assigned to ' + meta.assignee;
}

function buildBody(issue) {
  return sprintf(
    '{yellow-fg}DESCRIPTION{/yellow-fg}\n\n\t%s',
    issue.getDescription() ? issue.getDescription().replace(/\n/g, '\n\t') : 'No description'
  );
}

function buildComments(issue) {
  var out = '{yellow-fg}COMMENTS{/yellow-fg}';
  if(!issue.get('comments')) return out += '\t\n\n\tNo comments';


  if(!issue.fields.comment.comments.length) return out += '\t\n\n\tNo comments';

  return out + issue.fields.comment.comments.map(function(comment) {
    return '\n\n\t{blue-fg}' + comment.author.name + '{/blue-fg} ' +
      'at {blue-fg}' + formatDate(comment.created) + '{/blue-fg}\n\n\t\t' +
      formatCommentText(comment.body);
  }).join('');
}

function formatCommentText(text) {
  return text.split('\n').join('\n\t\t');
}

function formatDate(date) {
  var d = new Date(date);
  return "" + (1+d.getMonth()) + '-' + d.getDate() + '-' + d.getFullYear();
}
