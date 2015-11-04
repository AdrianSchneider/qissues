'use strict';

var Promise       = require('bluebird');
var UserInterface = require('../ui/app');
var NoConfigurationError;
var ReportManager = require('../domain/model/reportManager');

module.exports = function Application(container) {
  var exit;
  var config = container.get('config');
  var reports = new ReportManager(container.get('storage'));

  this.start = function(ui) {
    return config.initialize()
      .catch(NoConfigurationError, function() {
        return ui.capture(container.get('tracker.normalizer').getRequiredConfig())
          .then(config.save);
      })
      .then(function() {
        return ui.start(this);
      });
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
