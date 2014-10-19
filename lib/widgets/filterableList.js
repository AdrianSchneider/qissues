var _          = require('underscore');
var util       = require('util');
var blessed    = require('blessed');
var Sequencer  = require('../events/sequencer');
var Filter     = require('../model/filter');
var FilterSet  = require('../model/filterSet');
var message    = require('./message');
var FilterView = require('../views/filters');
var List       = require('./list');
var prompt     = require('./prompt');
var promptList = require('./promptList');

/**
 * A list with built in filtering mechanisms
 */
function FilterableList(options) {
  List.call(this, options || {});

  var self = this;
  var sequencer = new Sequencer(this);
  var filters = options.filters;
  var metadata = options.metadata;
  var reports = options.reports;
  var activeReport = options.report;

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

    return FilterView(self.screen, filters);
  };

  /**
   * Called when "fp" is pressed
   */
  var promptProject = function() {
    promptList(
      'Project',
      _.pluck(metadata.projects, 'key'),
      self.screen,
      addFilter('project')
    );
  };

  /**
   * Called when "fa" is pressed
   */
  var promptAssignee = function() {
    promptList(
      'Assignee',
      _.pluck(metadata.users, 'name'),
      self.screen,
      addFilter('assignee')
    );
  };

  /**
   * Called when "fs" is pressed
   */
  var promptStatus = function() {
    promptList(
      'Status',
      metadata.statuses,
      self.screen,
      addFilter('status')
    );
  };

  /**
   * Called when "fs" is pressed
   */
  var promptSprint = function() {
    prompt('Sprint', self.screen, addFilter('sprint'));
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
      if(text && text.length) {
        filters.add(new Filter(type, text));
      }
    };
  };

  /**
   * Called when ",rs" is pressed
   */
  var reportsSave = function() {
    prompt('Save as', self.screen, function(err, name) {
      reports.addReport(name, filters);
    });
  };

  /**
   * Called when ",rl" is pressed
   */
  var reportsList = function() {
    var reportList = promptList(
      'Reports',
      _.reject(
        _.invoke(reports.getReports(), 'getName'),
        function(r) { return r === 'default'; }
      ),
      self.screen,
      function(err, text) {
        if(!text) return;
        var report = reports.get(text);
        activeReport.replaceFilters(report.getFilters());
      }
    );

    reportList.key('x', function() {
      var name = reportList.items[reportList.selected].content;
      reports.remove(name);
      reportList.removeItem(reportList.selected);
      reportList.select(0);

      self.screen.render();
    });
  };

  setupFiltering();
  return self;
}



util.inherits(FilterableList, List);
module.exports = FilterableList;
