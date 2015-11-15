'use strict';

var _              = require('underscore');
var sprintf        = require('util').format;
var filterableList = require('../widgets/filterableList');
var UserInput      = require('../input');

/**
 * Issues View
 *
 * @param {blessed.Node} parent
 * @param {Application} app
 * @param {String|null} string to re-focus
 * @param {Promise<IssuesCollection>} issues
 *
 * @return {blessed.List}
 */
module.exports = function IssueList(parent, app, options) {
  var requiredOptions = ['normalizer', 'metadata', 'focus', 'keys', 'data', 'logger'];
  requiredOptions.forEach(function(key) {
    if (!(key in options)) throw new Error('IssueList requires options.' + key);
  });

  var normalizer = options.normalizer;
  var metadata = options.metadata;
  var focus = options.focus;
  var keys = options.keys;
  var data = options.data;
  var logger = options.logger;

  var main = function() {
    var list = createList();
    list.issues = [];

    data.done(function(issues) {
      updateListContents(list, issues);
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

    return list;
  };

  /**
   * Creates the list widget for this view
   *
   * @return {filterableList}
   */
  var createList = function() {
    return new filterableList({
      parent: parent,
      filters: app.getFilters(),
      report: app.getActiveReport(),
      reports: app.getReports(),
      input: new UserInput(parent, keys),
      logger: logger,
      normalizer: normalizer,
      metadata: metadata,
      name: 'issues',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      border: {
        type: 'line',
        fg: 'lightblack'
      },
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
  var updateListContents = function(list, issues) {
    list.issues = issues;
    parent.children.forEach(function(child) { parent.remove(child); });
    parent.append(list);
    list.setItems(issues.map(renderIssue));
    list.select(findLastFocused(list, focus));
    list.focus();
    parent.render();
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

  return main();
};
