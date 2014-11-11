var _         = require('underscore');
var util      = require('util');
var blessed   = require('blessed');
var message   = require('./message');

/**
 * A list with built in filtering mechanisms
 */
function List(options) {
  blessed.List.call(this, options || {});
  var self = this;

  var dataItems;
  var displayFunc;

  /**
   * Set up custom keys bindings
   */
  var init = function() {
    self.searchResults = [];
    self.resultNumber = -1;
    self.marker = '{red-fg}*{/red-fg} ';

    self.key('/', self.search);
    self.key('n', self.nextResult);
    self.key('S-n', self.prevResult);
    self.key(['escape', 'space'], self.clearSearch);
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
    self.setItems(collection.map(renderer));
  };

  /**
   * Starts a new search
   */
  this.search = function() {
    var input = new blessed.Textbox({
      parent: self.screen,
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
      self.screen.remove(input);
      self.screen.render();

      if(!text || !text.length) return;

      self.items.forEach(function(item) {
        item.content = '  ' + (item.content.replace(self.marker, '').trim());
      });

      self.searchResults = self.items.filter(function(item) {
        return item.content.toLowerCase().indexOf(text.toLowerCase()) !== -1;
      }).map(function(item) {
        item.content = self.marker + (item.content.trim());
        return self.items.indexOf(item);
      });

      if(!self.searchResults.length) {
        message(self.screen, 'Pattern not found');
        return self.clearSearch();
      }

      self.resultNumber = -1;
      self.nextResult();
    });

    self.screen.render();
  };

  /**
   * Clears the current search results
   */
  this.clearSearch = function() {
    self.searchResults = [];
    self.resultNumber = -1;

    self.items.forEach(function(item) {
      item.content = (item.content.replace(self.marker, '')).trim();
    });

    self.screen.render();
  };

  /**
   * Skips to the next search result
   */
  this.nextResult = function() {
    if(!self.searchResults.length) return;

    self.resultNumber++;
    if(typeof self.searchResults[self.resultNumber] === 'undefined') {
      self.resultNumber = 0;
    }

    self.select(self.searchResults[self.resultNumber]);
    self.screen.render();
  };

  /**
   * Skips to the previous search result
   */
  this.prevResult = function() {
    if(!self.searchResults.length) return;

    self.resultNumber--;
    if(typeof self.searchResults[self.resultNumber] === 'undefined') {
      self.resultNumber = self.searchResults.length - 1;
    }

    self.select(self.searchResults[self.resultNumber]);
    self.screen.render();
  };

  init();
  return self;
}

util.inherits(List, blessed.List);
module.exports = List;
