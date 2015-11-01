'use strict';

var _            = require('underscore');
var util         = require('util');
var blessed      = require('blessed');
var Sequencer    = require('../events/sequencer');
var Filter       = require('../../domain/model/filter');
var FilterSet    = require('../../domain/model/filterSet');
var message      = require('./message');
var filterView   = require('../views/filters');
var reportsList  = require('../views/reports');
var List         = require('./list');
var prompt       = require('./prompt');
var promptList   = require('./promptList');
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
      .on('rl', showReportsList);
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
        .then(function(text) { console.error(text); filters.add(new Filter(filter, text)); })
        .catch(Cancellation, _.noop);
    };
  };

  var reportsSave = function() {
    prompt('Save as')
      .then(function(name) { reports.addReport(name, filters); })
      .catch(Cancellation, _.noop);
  };

  var showReportsList = function() {
    reportsList(self.parent, options.reports);
  };

  setupFiltering();
  return self;
}

util.inherits(FilterableList, List);
module.exports = FilterableList;
