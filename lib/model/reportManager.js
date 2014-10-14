var _         = require('underscore');
var path      = require('path');
var fs        = require('fs');
var Filter    = require('./filter');
var FilterSet = require('./filterSet');

/**
 * Responsible for managing the reports and persisting them
 *
 * @param string filename to save reports
 */
function ReportManager(filename) {
  var reports = [];
  var self = this;
  var fileHandle;

  /**
   * Loads the reports into memory from disk
   * @return array
   */
  var load = function() {
    if(!fs.existsSync(filename)) {
      self.save();
    }

    return require(filename).reports.map(function(report) {
      return new Report(
        report.name,
        new FilterSet(report.filters.map(function(filter) {
          return new Filter(filter.type, filter.value);
        }))
      );
    });
  };

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
  };

  /**
   * Saves the reports back to disk
   */
  this.save = function() {
    console.error('writing data to ' + filename);
    fs.writeFileSync(filename, JSON.stringify({
      reports: _.invoke(reports, 'serialize')
    }, null, 2));
  };

  reports = load();
}

module.exports = ReportManager;
