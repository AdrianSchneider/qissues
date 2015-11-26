'use strict';

var _      = require('underscore');
var expect = require('chai').expect;
var Filter = require('../../src/domain/model/filter');

module.exports = function() {

  this.Given(/^the following issues\:/, function() {
    this.repository.empty();
  });

  this.Given(/^I filter "" by ""$/, function(field, value) {
    this.report.getFilters().add(new Filter(field, value));
  });

  this.Given(/^I have the following reports\:$/, function() {

  });

  this.When(/^I query issues$/, function() {
    this.issues = this.repository.query(this.report);
  });

  this.when(/^I activate the "([a-z]+)" report$/, function(reportName) {

  });

  this.Then(/^I should get issues \[([, 0-9]+)\] back$/, function(issues) {
    var expected = issues.replace(/ /g, '').split(',').sort();
    var found = _.invoke(this.issues, 'getId').sort();
    expect(found).to.deep.equal(expected);
  });

};
