'use strict';

var _       = require('underscore');
var blessed = require('blessed');
var Promise = require('bluebird');
var wordwrap = require('wordwrap');
var sprintf = require('util').format;

module.exports = function(app, keys, logger) {

  var main = function(parent, promisedIssue, promisedComments) {
    var box = blessed.box({
      parent: parent,
      width: parent.getInnerWidth('100%'),
      height: parent.getInnerHeight('100%'),
      tags: true,
      keys: true,
      vi: true,
      scrollable: true,
      alwaysScroll: true
    });

    console.error('box width = ' + box.width);

    Promise.all([promisedIssue, promisedComments])
      .spread(function(issue, comments) {
        box.setContent(renderIssue(issue, comments, box.width));
        box.getIssue = function() { return issue; };
        parent.append(box);
        box.focus();
        parent.screen.render();
      });

    return box;
  };

  var renderIssue = function(issue, comments, width) {
    return buildHeader(issue, width) + '\n\n' +
      buildMeta(issue, width) + '\n\n' +
      buildBody(issue, width) + '\n\n' +
      buildComments(comments, width);
  };

  var buildHeader = function(issue) {
    return sprintf(
      '{bold}{yellow-fg}%s{/yellow-fg} - %s{/bold}',
      issue.getId(),
      issue.getTitle()
    );
  };

  var buildMeta = function(issue) {
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
  };

  var getAssigned = function(meta) {
    if(!meta.assignee) return 'currently unassigned';
    return 'assigned to ' + meta.assignee;
  };

  var buildBody = function(issue, width) {
    return sprintf(
      '{yellow-fg}DESCRIPTION{/yellow-fg}\n\n\t%s',
      issue.getDescription() ? maintainIndentation(issue.getDescription(), 1, width) : 'No description'
    );
  };

  var buildComments = function(comments, width) {
    var out = '{yellow-fg}COMMENTS{/yellow-fg}';
    if(!comments.length) return out += '\t\n\n\tNo comments';

    return out + comments.map(function(comment) {
      return sprintf(
        '\n\n\t{blue-fg}%s{/blue-fg} at {blue-fg}%s{/blue-fg}\n\n%s',
        comment.getAuthor(),
        formatDate(comment.getDate()),
        maintainIndentation(comment.getMessage(), 2, width)
      );
    }).join('');
  };

  var maintainIndentation = function(text, level, maxWidth) {
    var indent = '';
    var spacer = '    ';
    for (var i = 0; i < level; i++) indent += spacer;

    return text
      .split('\n')
      .map(function(line) { return wordwrap(maxWidth - (level * spacer.length))(line); })
      .join('\n').split('\n')
      .map(function(line) { return indent + line; })
      .join('\n');
  };

  var formatDate = function(date) {
    var d = new Date(date);
    return "" + (1+d.getMonth()) + '-' + d.getDate() + '-' + d.getFullYear();
  };

  return main;

};
