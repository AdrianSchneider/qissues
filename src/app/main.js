'use strict';

var UserInterface = require('../ui/app');
var ReportManager = require('../domain/model/reportManager');

module.exports = function Application(container) {
  var exit;
  var reports = new ReportManager(container.get('storage'));

  this.start = function(ui) {
    ui.start(this);
  };

  this.get = function(name) {
    return container.get(name);
  };

  this.getReports = function() {
    return reports;
  };

  this.getFilters = function() {
    return this.getActiveReport().getFilters();
  };

  this.getActiveReport = function() {
    return reports.getDefault();
  };

  this.exit = function(f) {
    exit = f;
  };

  this.onExit = exit;

};
