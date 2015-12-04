'use strict';

var _                = require('underscore');
var blessed          = require('blessed');
var Promise          = require('bluebird');
var wordwrap         = require('wordwrap');
var sprintf          = require('util').format;
var Sequencer        = require('../events/sequencer');
var IssuesCollection = require('../../domain/model/issues');

module.exports = function(app, keys, input, metadata, behaviors, logger) {

  /**
   * Renders a single issue view
   *
   * @param {blessed.Element} parent
   * @param {Promise<Issue>} promisedIssue
   * @param {Promise<CommentsCollection>} promisedComents
   * @return {blessed.Element}
   */
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

    behaviors.forEach(function(behavior) { behavior(box); });

    var selected = [];
    box.getSelectedIssues = function() { return selected; };
    box.getIssues = function() { return []; };
    box.clearSelection = _.noop;

    Promise.all([promisedIssue, promisedComments])
      .spread(function(issue, comments) {
        selected = [issue.getId()];
        box.setContent(renderIssue(issue, comments, box.width));
        box.getIssue = function() { return issue; };
        box.getIssues = function() { return new IssuesCollection([issue]); };

        parent.append(box);
        box.focus();
        parent.screen.render();
      });

    return box;
  };

  /**
   * Renders the content for the issue
   *
   * @param {Issue} issue
   * @param {CommentsCollection} comments
   * @param {Number} width
   * @return {String} - rendered issue
   */
  var renderIssue = function(issue, comments, width) {
    return buildHeader(issue, width) + '\n\n' +
      buildMeta(issue, width) + '\n\n' +
      buildBody(issue, width) + '\n\n' +
      buildComments(comments, width);
  };

  /**
   * Renders the title of the issue
   *
   * @param {Issue} issue
   * @return {String} - rendered metadata
   */
  var buildHeader = function(issue) {
    return sprintf(
      '{bold}{yellow-fg}%s{/yellow-fg} - %s{/bold}',
      issue.getId(),
      issue.getTitle()
    );
  };

  /**
   * Renders the metadata of the issue
   *
   * @param {Issue} issue
   * @param {Number} width
   * @return {String} - rendered metadata
   */
  var buildMeta = function(issue, width) {
    var meta = _.mapObject({
      status      : issue.getStatus(),
      type        : issue.get('type'),
      priority    : issue.get('priority'),
      dateCreated : issue.get('dateCreated'),
      dateUpdated : issue.get('dateCreated'),
      reporter    : issue.get('reporter'),
      assignee    : issue.get('assignee')
    }, String);

    return maintainIndentation(
      sprintf(
        '{blue-fg}%s{/blue-fg} %s %s %s\nreported by %s on %s',
        meta.status,
        meta.type,
        getAssigned(meta),
        meta.priority,
        meta.reporter,
        meta.dateCreated
    ), 1, width);
  };

  /**
   * Gets the assignee
   *
   * @param {Object} meta - metadata
   * @return {String}
   */
  var getAssigned = function(meta) {
    if(!meta.assignee) return 'currently unassigned';
    return 'assigned to ' + meta.assignee;
  };

  /**
   * Renders the Body
   *
   * @param {Issue} issue
   * @param {Number} width - of container
   * @return {String} - rendered body
   */
  var buildBody = function(issue, width) {
    return sprintf(
      '{yellow-fg}DESCRIPTION{/yellow-fg}\n\n%s',
      maintainIndentation(issue.getDescription() || 'No description', 1, width)
    );
  };

  /**
   * Renders the comments
   *
   * @param {CommentsCollection} comments
   * @param {Number} width - of container
   * @return {String} - rendered comments
   */
  var buildComments = function(comments, width) {
    var out = '{yellow-fg}COMMENTS{/yellow-fg}';
    if(!comments.length) return out += '    \n\n    No comments';

    return out + comments.map(function(comment) {
      return sprintf(
        '\n\n    {blue-fg}%s{/blue-fg} at {blue-fg}%s{/blue-fg}\n\n%s',
        comment.getAuthor(),
        formatDate(comment.getDate()),
        maintainIndentation(comment.getMessage(), 2, width)
      );
    }).join('');
  };

  /**
   * Indents a string on each line, while also wrapping words
   * The need for this goes away when we can wrap each item in a proper box
   *
   * @param {String} text
   * @param {Number} level - indentation level
   * @param {Number} maxWidth - size of container
   */
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

  /**
   * Formats a date
   *
   * @param {Date} date
   * @return {String}
   */
  var formatDate = function(date) {
    var d = new Date(date);
    return "" + (1+d.getMonth()) + '-' + d.getDate() + '-' + d.getFullYear();
  };

  return main;

};
