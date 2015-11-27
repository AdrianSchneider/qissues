'use strict';

var Storage       = require('../../../src/app/services/storage/memory');
var Repository    = require('../../../src/domain/backend/memory/repository');
var Normalizer    = require('../../../src/domain/backend/memory/normalizer');
var ReportManager = require('../../../src/domain/model/reportManager');

function DomainSetup() {
  this.normalizer = new Normalizer();
  this.repository = new Repository(this.normalizer);
  this.reportManager = new ReportManager(new Storage());
}

module.exports = function() {
  this.World = DomainSetup;
};
