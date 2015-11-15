'use strict';

var Promise       = require('bluebird');
var UserInterface = require('../ui/app');
var NoConfigurationError;
var ReportManager = require('../domain/model/reportManager');

module.exports = function Application(container) {
  var exit;
  var reports;
  var conf;
  var app = this;

  this.start = function(ui) {
    return container.get('config').bind(app)
      .then(function(config) {
        conf = config;
        return config.initialize();
          //.catch(NoConfigurationError, function() {
          //  console.error('not initialized');
          //  return container.get('tracker.normalizer')
          //    .then(function(normalizer) {
          //      return ui.capture(normalizer.getRequiredConfig());
          //    })
          //    .then(conf.save);
          //});
      })
      .then(function() {
        var services = ['logger', 'domain.report-manager'];
        return Promise.map(services, function(s) { return container.get(s); })
          .spread(function(logger, reportManager) {
            reports = reportManager;
            return ui.start(app, null, null, logger);
          });
      });
  };

  this.get = function(name, def) {
    return container.get(name, def);
  };
  this.getMatching = function(keys) {
    return container.getMatching(keys);
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
