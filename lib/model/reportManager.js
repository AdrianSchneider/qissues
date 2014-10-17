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
  var reports = [{ name: "default", filters: [] }];

  /**
   * Gets the reports from memory
   * @return Report[]
   */
  this.getReports = function() {
    return reports;
  };

  /**
   * Get a report by name
   * @return Report|null
   */
  this.get = function(name) {
    return _.find(reports, function(report) {
      return report.getName() === name;
    });
  };

  /**
   * Adds a new report
   *
   * @param string name
   * @param FilterSet filters
   */
  this.addReport = function(name, filters) {
    reports.push(new Report(name, filters.clone()));
    storage.set('reports', self.serialize());
  };

  /**
   * Removes reports matching name
   * @param string name
   */
  this.remove = function(name) {
    reports = _.reject(reports, function(report) {
      return name === report.getName();
    });
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

    if(def) return def;

    this.addReport('default', new FilterSet([]));
    return this.get('default');
  };

  reports = this.unserialize(storage.get('reports', []));
  var def = this.getDefault();
  if(def) {
    def.on('change', function() {
      storage.set('reports', self.serialize());
    });
  }


}

module.exports = ReportManager;
