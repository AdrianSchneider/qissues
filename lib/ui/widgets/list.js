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
  var list = this;

  var dataItems;
  var displayFunc;

  /**
   * Set up custom keys bindings
   */
  var init = function() {
    list.searchResults = [];
    list.resultNumber = -1;
    list.marker = '{red-fg}*{/red-fg} ';

    list.key('/', list.search);
    list.key('n', list.nextResult);
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

      list.items.forEach(function(item) {
        item.content = '  ' + (item.content.replace(list.marker, '').trim());
      });

      list.searchResults = list.items.filter(function(item) {
        return item.content.toLowerCase().indexOf(text.toLowerCase()) !== -1;
      }).map(function(item) {
        item.content = list.marker + (item.content.trim());
        return list.items.indexOf(item);
      });

      if(!list.searchResults.length) {
        message(list.screen, 'Pattern not found');
        return list.clearSearch();
      }

      list.resultNumber = -1;
      list.nextResult();
    });

    list.screen.render();
  };

  /**
   * Clears the current search results
   */
  this.clearSearch = function() {
    list.searchResults = [];
    list.resultNumber = -1;

    list.items.forEach(function(item) {
      item.content = (item.content.replace(list.marker, '')).trim();
    });

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

  init();
  return list;
}

util.inherits(List, blessed.List);
module.exports = List;
