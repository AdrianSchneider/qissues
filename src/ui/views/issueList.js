'use strict';

var _              = require('underscore');
var sprintf        = require('util').format;
var filterableList = require('../widgets/filterableList');
var UserInput      = require('../input');
var editable       = require('./editable');

/**
 * Dependencies for issue list
 */
module.exports = function(app, tracker, input, keys, logger) {
  var metadata = tracker.getMetadata();
  var normalizer = tracker.getNormalizer();

  /**
   * Returns the list view
   *
   * @param {Promise<IssuesCollection>} issues
   * @param {String|null} focus - text from last selection
   * @param {blessed.Element} parent
   *
   * @return {blessed.List}
   */
  var main = function(promisedIssues, focus, parent) {
    var list = createList(parent);
    editable(list, keys, input, metadata);
    list.issues = [];

    promisedIssues.done(function(issues) {
      updateListContents(list, issues, focus, parent);
    });

    list.on('select', function() {
      list.emit('open', list.getSelected());
    });

    list.getSelected = function() {
      return list.issues.get(list.selected).getId();
    };

    list.getIssue = function() {
      return list.issues.get(list.selected);
    };

    list.render();
    parent.render();
    parent.screen.render();

    return list;
  };

  /**
   * Creates the list widget for this view
   *
   * @return {filterableList}
   */
  var createList = function(parent) {
    return new filterableList({
      parent: parent,
      filters: app.getFilters(),
      report: app.getActiveReport(),
      reports: app.getReports(),
      input: input,
      logger: logger,
      normalizer: normalizer,
      metadata: metadata,
      name: 'issues',
      width: parent.getInnerWidth('100%'),
      height: parent.getInnerHeight('100%'),
      top: 0,
      left: 0,
      tags: true,
      selectedFg: 'black',
      selectedBg: 'green',
      keys: true,
      keyConfig: keys,
      vi: true
    });

  };

  /**
   * Redraws the list with the passed in data
   *
   * @param {IssueList} list
   * @param {IssuesCollection} issues
   */
  var updateListContents = function(list, issues, focus, parent) {
    list.issues = issues;
    parent.children.forEach(function(child) { parent.remove(child); });
    parent.append(list);
    list.setItems(issues.map(renderIssue));
    list.items.forEach(function(item) {
      item.originalContent = item.content;
    });
    list.select(findLastFocused(list, focus));
    list.focus();

    parent.screen.render();
  };

  /**
   * Finds the list index to select, based on what may have been selected before
   *
   * @param {IssueList} list
   * @param {String|null} focused - previous focus key
   * @return {Number} a zero-based index of the list
   */
  var findLastFocused = function(list, focused) {
    if (!focused) return 0;
    return _.findIndex(list.ritems, function(item) {
      return item.toLowerCase().indexOf(focused.toLowerCase()) !== -1;
    }) || 0;
  };

  /**
   * Converts an Issue into the list item text
   *
   * @param {Issue} issue
   * @return {String}
   */
  var renderIssue = function(issue) {
    return sprintf(
      '{yellow-fg}%s{/yellow-fg}: %s',
      issue.getId(),
      issue.getTitle()
    );
  };

  return main;

};
