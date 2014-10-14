var _         = require('underscore');
var util      = require('util');
var blessed   = require('blessed');
var Sequencer = require('../events/sequencer');
var Filter    = require('../model/filter');
var FilterSet = require('../model/filterSet');
var message   = require('./message');
var FilterView     = require('../views/filters');

/**
 * A list with built in filtering mechanisms
 */
function FilterableList(options) {
  blessed.List.call(this, options || {});
  var self = this;

  var sequencer = new Sequencer(this);
  var filters = new FilterSet();
  filters.on('change', function() {
    self.emit('filter', filters.get());
  });

  /**
   * Sets up the filtering system
   */
  var setupFiltering = function() {
    sequencer
      .on('f?', getHelp)
      .on('fl', showFilters)
      .on('fa', promptAssignee)
      .on('fs', promptStatus);
  };

  /**
   * Called when "f?" is pressed
   */
  var getHelp = function(err, text) {
    console.log('man pages');
    this.screen.render();
  };

  /**
   * Called when "fl" is pressed
   */
  var showFilters = function() {
    if (!filters.serialize().length) {
      return message(this.screen, 'No filters defined');
    }

    return FilterView(this.screen, filters);
  };

  /**
   * Called when "fa" is pressed
   */
  var promptAssignee = function() {
    prompt('Assignee', addFilter('assignee'));
  };

  /**
   * Called when "fs" is pressed
   */
  var promptStatus = function() {
    prompt('Status', addFilter('status'));
  };

  /**
   * Returns a function to handle a filter addition
   *
   * @param string text type (assignee, status, etc.)
   * @return function
   */
  var addFilter = function(type) {
    return function(err, text) {
      if(err) return console.log(err.message);
      filters.add(new Filter(type, text));
    };
  };


  /**
   * Prompt for user input
   *
   * @param string   prompt text
   * @param function done   err,text
   */
  var prompt = function(text, done) {
    var form = new blessed.form({
      top: 'center',
      left: 'center',
      content: text,
      width: 70,
      height: 3,
      tags: true,
      parent: self.parent,
      border: { type: 'bg' },
      padding: { left: 1, right: 1, top: 0, bottom: 0 },
      style: {
        fg: 'black',
        bg: 'yellow',
        hover: {
          bg: 'green'
        }
      }
    });

    var input = new blessed.Textbox({
      top: 'center',
      right: 0,
      width: form.width - text.length - 4,
      height: 1,
      input: true,
      tags: true,
      parent: form,
      style: {
        fg: 'black',
        bg: 'yellow'
      }
    });

    input.readInput(function(err, text) {
      self.parent.remove(form);
      self.parent.render();
      done(err, text);
    });

    self.parent.render();
  };


  setupFiltering();
  return self;
}



util.inherits(FilterableList, blessed.List);
module.exports = FilterableList;
