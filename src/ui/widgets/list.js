'use strict';

var _         = require('underscore');
var util      = require('util');
var blessed   = require('blessed');
var message   = require('./message');

/**
 * A Re-usable list widget with built in filtering mechanisms
 */
function List(options) {
  blessed.List.call(this, options || {});
  var activeSearch = '';
  var activeSelection = false;
  var list = this;
  var selected = [];

  var dataItems;
  var displayFunc;

  /**
   * Set up custom keys bindings
   */
  var init = function() {
    list.searchResults = [];
    list.resultNumber = -1;

    list.key('/', list.search);
    list.key('n', list.nextResult);
    list.key('S-x', list.clearSelection);
    list.key('x', list.toggle);
    list.key('S-n', list.prevResult);
    list.key(['escape', 'space'], function(el) {
      if(el !== list) return;
      list.clearSearch();
    });
  };

  /**
   * Sets the items using a collection and a renderer
   *
   * @param array    collection
   * @param function renderer
   */
  this.setCollection = function(collection, renderer) {
    dataItems = collection;
    displayFunc = renderer;
    list.setItems(collection.map(renderer));
  };

  /**
   * Starts a new search
   */
  this.search = function() {
    var input = new blessed.Textbox({
      parent: list.screen,
      bottom: 0,
      right: 0,
      width: 50,
      height: 1,
      style: {
        fg: 'white',
        bg: 'lightblack'
      }
    });

    input.readInput(function(err, text) {
      list.screen.remove(input);
      list.screen.render();

      if(!text || !text.length) return;
      activeSearch = text;

      list.items.forEach(redraw);
      list.searchResults = list.items.filter(isResult);
      if(!list.searchResults.length) {
        message(list.screen, 'Pattern not found');
        return list.clearSearch();
      }

      list.resultNumber = -1;
      list.nextResult();
      list.screen.render();
    });

    list.screen.render();
  };

  /**
   * Clears the current search results
   */
  this.clearSearch = function(e) {
    if(!list.focused) return;
    list.searchResults = [];
    list.resultNumber = -1;
    activeSearch = '';
    list.items.forEach(redraw);
    list.screen.render();
  };

  /**
   * Skips to the next search result (circular)
   */
  this.nextResult = function() {
    if(!list.searchResults.length) return;

    list.resultNumber++;
    if(typeof list.searchResults[list.resultNumber] === 'undefined') {
      list.resultNumber = 0;
    }

    list.select(list.searchResults[list.resultNumber]);
    list.screen.render();
  };

  /**
   * Skips to the previous search result (circular)
   */
  this.prevResult = function() {
    if(!list.searchResults.length) return;

    list.resultNumber--;
    if(typeof list.searchResults[list.resultNumber] === 'undefined') {
      list.resultNumber = list.searchResults.length - 1;
    }

    list.select(list.searchResults[list.resultNumber]);
    list.screen.render();
  };

  /**
   * Toggles the selection for the selected item
   */
  this.toggle = function() {
    var key = list.issues.get(list.selected).getId();
    var index = selected.indexOf(key);
    var oldActiveSelection = activeSelection;

    if (index === -1) {
      selected.push(key);
    } else {
      selected.splice(index, 1);
    }

    activeSelection = selected.length > 0;
    if(activeSelection != oldActiveSelection) {
      list.items.forEach(redraw);
    } else {
      redraw(list.items[list.selected]);
    }

    list.screen.render();
  };

  /**
   * Clears the current selection of items
   */
  this.clearSelection = function() {
    activeSelection = false;
    selected = [];
    list.items.forEach(redraw);
    list.screen.render();
  };

  /**
   * Checks to see if the item is currently checked
   *
   * @param {blessed.Box} item
   * @return {Boolean} true if checked/toggled
   */
  var isChecked = function(item) {
    var key = list.issues.get(item.index - 1).getId();
    var index = selected.indexOf(key);
    return index !== -1;
  };

  /**
   * Checks to see if the item is a search result
   *
   * @param {blessed.Box} item
   * @return {Boolean} true if matching the current search criteria
   */
  var isResult = function(item) {
    return (
      activeSearch &&
      item.originalContent.toLowerCase().indexOf(activeSearch.toLowerCase()) !== -1
    );
  };

  /**
   * Redraws an item in the list
   *
   * @param {blessed.Box}
   */
  var redraw = function(item) {
    item.content = getDecorated(item);
  };

  /**
   * Redraws an item based on the state, decorating with optional markers
   *
   * Since markers can either wrap or prefix, we first check to see if any items match the marker
   * before attempting to draw it
   *
   * Then, draw the item, by decorating once for each valid marker
   *
   * @param {blessed.Box} item
   * @return {String} decorated item content
   */
  var getDecorated = function(item) {
    return getMarkers()
      .filter(function(marker) { return marker.activeTest(); })
      .reduce(function(out, marker) {
        if (marker.test(item)) {
          return marker.activeDecorator(out);
        } else {
          return marker.inactiveDecorator(out);
        }
      }, item.originalContent);
  };

  /**
   * Returns the configured markers
   *
   * name: arbitrary string
   * test: function see which decorator should be applied
   * activeTest: function to see if either decorated should be applied at all
   * activeDecorator: decorator when test is true
   * inactiveDecorator: decorator when test is false
   *
   * @return {Array}
   */
  var getMarkers = function() {
    return [{
      name: 'search',
      test: isResult,
      activeTest: function() { return !!activeSearch; },
      activeDecorator: function(text) { return '{red-fg}*{/red-fg}' + ' ' + text; },
      inactiveDecorator: function(text) { return '  ' + text; }
    }, {
      name: 'checked',
      test: isChecked,
      activeTest: function() { return selected.length > 0; },
      activeDecorator: function(text) { return '{yellow-fg}x{/yellow-fg}' + ' ' + text; },
      inactiveDecorator: function(text) { return '  ' + text; }
    }];
  };

  /**
   * Returns the selected issues for editing
   *
   * If a selection was made, those issues will be returned
   * If nothing is selected, it will pick the item under the cursor
   *
   * @return {Array<String>}
   */
  list.getSelectedIssues = function() {
    if (selected.length) return selected;
    return [list.issues.get(list.selected).getId()];
  };

  init();
  return list;
}

util.inherits(List, blessed.List);
module.exports = List;
