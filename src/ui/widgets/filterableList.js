'use strict';

var _          = require('underscore');
var util       = require('util');
var blessed    = require('blessed');
var Sequencer  = require('../events/sequencer');
var Filter     = require('../../domain/model/filter');
var FilterSet  = require('../../domain/model/filterSet');
var message    = require('./message');
var filterView = require('../views/filters');
var List       = require('./list');
var prompt     = require('./prompt');
var promptList = require('./promptList');
var Cancellation = require('../../errors/cancellation');

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
  var input = options.input;

  /**
   * Sets up the filtering system
   */
  var setupFiltering = function() {
    sequencer
      .on('fl', showFilters)
      .on('fp', filter(metadata.getProjects, 'Project',  'project'))
      .on('fa', filter(metadata.getUsers,    'Assignee', 'assignee'))
      .on('fs', filter(metadata.getStatuses, 'Status',   'status'))
      .on('fS', filter(metadata.getSprints,  'Sprint',   'sprint'));

    sequencer
      .on('rs', reportsSave)
      .on('rl', reportsList);
  };

  var showFilters = function() {
    if (!filters.serialize().length) {
      return message(this.screen, 'No filters defined');
    }

    return filterView(self.screen, filters);
  };

  var filter = function(getOptions, message, filter) {
    return function() {
      getOptions()
        .then(input.selectFromListWith(message))
        .then(function(text) { filters.add(new Filter(filter, text)); })
        .catch(Cancellation, _.noop);
    };
  };

  var reportsSave = function() {
    prompt('Save as')
      .then(function(name) { reports.addReport(name, filters); })
      .catch(Cancellation, _.noop);
  };

  var reportsList = function() {
    var reportList = promptList(
      'Reports',
      _.reject(
        _.invoke(reports.getReports(), 'getName'),
        function(r) { return r === 'default'; }
      ),
      self.screen
    );

    reportList.on('select', function(item, i) {
      if (!item.content) return;
      var report = reports.get(item.content);
      activeReport.replaceFilters(report.getFilters());
    });

    reportList.on(['escape', 'h'], function() {
      self.screen.remove(reportList);
      self.screen.render();
    });

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
