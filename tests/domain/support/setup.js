'use strict';

var Storage       = require('../../../src/app/services/storage/memory');
var Repository    = require('../../../src/domain/backend/memory/repository');
var Normalizer    = require('../../../src/domain/backend/memory/normalizer');
var Metadata      = require('../../../src/domain/backend/memory/metadata');
var ReportManager = require('../../../src/domain/model/reportManager');

function DomainSetup() {
  this.normalizer = new Normalizer();
  this.repository = new Repository(this.normalizer);
  this.metadata = new Metadata();

  this.getNewReportManager = function(data) {
    return new ReportManager(new Storage({ reports: data }));
  };

  this.reportManager = this.getNewReportManager();
}

module.exports = function() {
  this.World = DomainSetup;
};
