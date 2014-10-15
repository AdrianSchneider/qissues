var _          = require('underscore');
var util       = require('util');
var blessed    = require('blessed');
var Sequencer  = require('../events/sequencer');
var Filter     = require('../model/filter');
var FilterSet  = require('../model/filterSet');
var message    = require('./message');
var FilterView = require('../views/filters');

/**
 * A list with built in filtering mechanisms
 */
function FilterableList(options) {
  blessed.List.call(this, options || {});

  var self = this;
  var sequencer = new Sequencer(this);
  var filters = options.filters;
  var metadata = options.metadata;
  var reports = options.reports;

  /**
   * Sets up the filtering system
   */
  var setupFiltering = function() {
    sequencer
      .on('f?', getHelp)
      .on('fl', showFilters)
      .on('fp', promptProject)
      .on('fa', promptAssignee)
      .on('fs', promptStatus)
      .on('fS', promptSprint);

    sequencer
      .on('rs', reportsSave)
      .on('rl', reportsList);
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
   * Called when "fp" is pressed
   */
  var promptProject = function() {
    promptList(
      'Project', 
      _.pluck(metadata.projects, 'key'),
      addFilter('project')
    );
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
    promptList(
      'Status', 
      metadata.statuses,
      addFilter('status')
    );
  };

  /**
   * Called when "fs" is pressed
   */
  var promptSprint = function() {
    prompt('Sprint', addFilter('sprint'));
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
      if(text.length) {
        filters.add(new Filter(type, text));
      }
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

  /**
   * Prompt for user input
   *
   * @param string   prompt text
   * @param array    options
   * @param function done   err,text
   */
  var promptList = function(text, options, done) {
    var list = new blessed.List({
      parent: self.screen,
      width: '30%',
      height: '20%',
      top: 'center',
      left: 'center',
      tags: true,
      bg: 'lightblack',
      selectedFg: 'black',
      selectedBg: 'yellow',
      keys: true,
      vi: true,
      border: {
        type: 'line'
      }
    });

    list.setItems(options);
    list.select(0);
    list.focus();

    list.on('select', function(item, i) {
      self.parent.remove(list);
      self.parent.render();
      return done(null, item.content);
    });

    list.key(['escape', 'h'], function() {
      self.screen.remove(list);
      self.screen.render();
      done(null, '');
      return false;
    });

    self.parent.render();
  };

  var reportsSave = function() {
    prompt('Save as', function(err, name) {
      reports.addReport(name, filters);
    });
  };

  var reportsList = function() {};

  setupFiltering();
  return self;
}



util.inherits(FilterableList, blessed.List);
module.exports = FilterableList;
