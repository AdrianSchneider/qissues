'use strict';

var Promise       = require('bluebird');
var UserInterface = require('../ui/app');
var NoConfigurationError;
var ReportManager = require('../domain/model/reportManager');

module.exports = function Application(config, reportManager) {
  var exit;
  var conf;
  var app = this;

  this.start = function(ui) {
    ui.start();
  };

  this.getReports = function() {
    return reportManager;
  };

  this.getFilters = function() {
    return this.getActiveReport().getFilters();
  };

  this.getActiveReport = function() {
    return reportManager.getDefault();
  };

  this.exit = function(f) {
    exit = f;
  };

  this.onExit = exit;

};
