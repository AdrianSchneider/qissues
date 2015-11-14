'use strict';

var _       = require('underscore');
var blessed = require('blessed');
var Promise = require('bluebird');
var sprintf = require('util').format;

/**
 * Single Issue View
 *
 * @param {blessed.Node} parent
 * @param {Application} app
 * @param {Promise<Issue>} issue
 */
module.exports = function(parent, app, promisedIssue, promisedComments) {
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

  Promise.all([promisedIssue, promisedComments])
    .spread(function(issue, comments) {
      box.setContent(renderIssue(issue, comments));
      box.getIssue = function() {
        return issue;
      };
      parent.append(box);
      box.focus();
      parent.render();
    });

  return box;
};

function renderIssue(issue, comments) {
  return buildHeader(issue) + '\n\n' +
    buildMeta(issue) + '\n\n' +
    buildBody(issue) + '\n\n' +
    buildComments(comments);
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

  return sprintf(
    '\t{blue-fg}%s{/blue-fg} %s %s %s\n\treported by %s on %s',
    meta.status,
    meta.type,
    getAssigned(meta),
    meta.priority,
    meta.reporter,
    meta.dateCreated
  );
}

function getAssigned(meta) {
  if(!meta.assignee) return 'currently unassigned';
  return 'assigned to ' + meta.assignee;
}

function buildBody(issue) {
  return sprintf(
    '{yellow-fg}DESCRIPTION{/yellow-fg}\n\n\t%s',
    issue.getDescription() ? maintainIndentation(issue.getDescription(), 1) : 'No description'
  );
}

function buildComments(comments) {
  var out = '{yellow-fg}COMMENTS{/yellow-fg}';
  if(!comments.length) return out += '\t\n\n\tNo comments';

  return out + comments.map(function(comment) {
    return sprintf(
      '\n\n\t{blue-fg}%s{/blue-fg} at {blue-fg}%s{/blue-fg}\n\n\t\t%s',
      comment.getAuthor(),
      formatDate(comment.getDate()),
      maintainIndentation(comment.getMessage(), 2)
    );
  }).join('');
}

function formatCommentText(text) {
  return text.split('\n').join('\n\t\t');
}

function maintainIndentation(text, level) {
  return text
    .split('\n')
    .join('\n' + _.range(level).map(_.constant('\t')));
}

function formatDate(date) {
  var d = new Date(date);
  return "" + (1+d.getMonth()) + '-' + d.getDate() + '-' + d.getFullYear();
}
