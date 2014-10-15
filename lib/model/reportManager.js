var _         = require('underscore');
var path      = require('path');
var fs        = require('fs');
var Report    = require('./report');
var Filter    = require('./filter');
var FilterSet = require('./filterSet');

/**
 * Responsible for managing the reports and persisting them
 *
 * @param string filename to save reports
 */
function ReportManager(storage) {
  var self = this;
  var reports = [];

  /**
   * Gets the reports from memory
   * @return Report[]
   */
  this.getReports = function() {
    return reports;
  };

  /**
   * Adds a new report
   *
   * @param string name
   * @param FilterSet filters
   */
  this.addReport = function(name, filters) {
    reports.push(new Report(name, filters));
    storage.set('reports', self.serialize());
  };

  /**
   * Serializes the in-memory data for storage
   *
   * @return array
   */
  this.serialize = function() {
    return _.invoke(reports, 'serialize');
  };

  /**
   * Unserializes the stored memory back into Reports
   * @param array data
   * @return Report[]
   */
  this.unserialize = function(data) {
    return data.map(function(report) {
      return new Report(
        report.name,
        new FilterSet(report.filters.map(function(filter) {
          return new Filter(filter.type, filter.value);
        }))
      );
    });
  };

  /**
   * Returns the default filters
   * @eturn Report
   */
  this.getDefault = function() {
    var def = _.find(reports, function(report) {
      return report.getName() == 'default';
    });

    return def ? def : new Report('default', new FilterSet([]));
  };

  reports = this.unserialize(storage.get('reports', []));
}

module.exports = ReportManager;
