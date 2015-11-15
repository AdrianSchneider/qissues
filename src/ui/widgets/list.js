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
    list.resultMarker = '{red-fg}*{/red-fg}';
    list.checkMarker = '{yellow-fg}x{/yellow-fg}';

    list.key('/', list.search);
    list.key('n', list.nextResult);
    list.key('S-x', list.clearSelection);
    list.key('x', list.toggle);
    list.key('S-n', list.prevResult);
    list.key(['escape', 'space'], list.clearSearch);
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

      list.items.forEach(function(item) { item.content = redrawItem(item); });
      list.searchResults = list.items.filter(isResult);
      if(!list.searchResults.length) {
        message(list.screen, 'Pattern not found');
        return list.clearSearch();
      }

      list.resultNumber = -1;
      list.nextResult();
      console.error('rendering screen...');
      list.screen.render();
    });

    list.screen.render();
  };

  /**
   * Clears the current search results
   */
  this.clearSearch = function() {
    list.searchResults = [];
    list.resultNumber = -1;
    activeSearch = '';
    list.items.forEach(function(item) { item.content = redrawItem(item); });
    list.screen.render();
  };

  /**
   * Skips to the next search result
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
   * Skips to the previous search result
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
      list.items.forEach(function(item) { item.content = redrawItem(item); });
    } else {
      list.items[list.selected].content = redrawItem(list.items[list.selected]);
    }

    list.screen.render();
  };

  this.clearSelection = function() {
    activeSelection = false;
    selected = [];
    list.items.forEach(function(item) { item.content = redrawItem(item); });
    list.screen.render();
  };

  var isChecked = function(item) {
    var key = list.issues.get(item.index - 1).getId();
    var index = selected.indexOf(key);
    return index !== -1;
  };

  var isResult = function(item) {
    return activeSearch && item.originalContent.toLowerCase().indexOf(activeSearch.toLowerCase()) !== -1;
  };

  /**
   * Redraws an item based on the state
   */
  var redrawItem = function(item) {
    var markers = [{
      name: 'search',
      test: isResult,
      marker: list.resultMarker,
      activeTest: function() { return !!activeSearch; },
      activeDecorator: function(text) { return list.resultMarker + ' ' + text; },
      inactiveDecorator: function(text) { return '  ' + text; }
    }, {
      name: 'checked',
      test: isChecked,
      activeTest: function() { return selected.length > 0; },
      activeDecorator: function(text) { return list.checkMarker + ' ' + text; },
      inactiveDecorator: function(text) { return '  ' + text; }
    }];

    return markers
      .filter(function(marker) { return marker.activeTest(); })
      .reduce(function(out, marker) {
        if (marker.test(item)) {
          return marker.activeDecorator(out);
        } else {
          return marker.inactiveDecorator(out);
        }
      }, item.originalContent);
  };

  init();
  return list;
}

util.inherits(List, blessed.List);
module.exports = List;
