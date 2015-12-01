'use strict';

var _       = require('underscore');
var assert  = require('chai').assert;
var Promise = require('bluebird');
var f       = require('../../../src/util/f');
var Filter  = require('../../../src/domain/model/filter');

module.exports = function() {

  this.Given(/^the following issues\:/, function(table) {
    var context = this;
    this.repository.empty();
    return Promise.each(table.hashes(), function(issue) {
      return context.repository.createIssue(context.normalizer.toNewIssue(issue));
    });
  });

  this.Given(/^I filter "([^"]*)" by "([^"]*)"$/, function(type, value) {
    this.reportManager.getDefault().getFilters().add(new Filter(type, value));
  });

  this.Given(/^I have the following reports\:$/, function(table) {
    this.reportManager = this.getNewReportManager(_.chain(table.hashes())
      .groupBy('name')
      .mapObject(function(filters, name) {
        return {
          name: name,
          filters: filters.map(function(f) { return _.omit(f, 'name'); })
        };
      })
      .values()
      .value()
    );
  });

  this.When(/^I query issues$/, function() {
    return this.repository.query(this.reportManager.getDefault())
      .then(f.tee(this, 'issues'));
  });

  this.When(/^I activate the "([a-z]+)" report$/, function(reportName) {
    this.reportManager.getDefault().replaceFilters(
      this.reportManager.get(reportName).getFilters()
    );
  });

  this.Given(/^no issues$/, function() {
    this.repository.empty();
  });

  this.Given(/^the following users: ([ ,a-z]+)$/, function(users) {
    this.metadata.setUsers(toList(users));
  });

  this.Given(/^the following types: ([ ,a-z]+)$/i,function(types) {
    this.metadata.setTypes(toList(types));
  });

  this.Given(/^the following projects: ([ ,a-z]+)$/i, function(projects) {
    this.metadata.setProjects(toList(projects));
  });

  this.When(/^I go to create an issue$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Then(/^I should get prompted for:$/, function (table, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.When(/^I submit the following issue:$/, function (table, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Then(/^the issue should be persisted$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Then(/^the "([^"]*)" should equal "([^"]*)"$/, function (arg1, arg2, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Then(/^the issue should fail to post$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Given(/^I save the report as "([^"]*)"$/, function(reportName) {
    this.reportManager.addReport(
      reportName,
      this.reportManager.getDefault().getFilters()
    );
  });

  this.Then(/^I should get issues \[([, 0-9]+)\] back$/, function(issues) {
    assert.deepEqual(
      this.issues.getIds().sort(),
      issues.replace(/ /g, '').split(',').sort()
    );
  });

  this.Then(/^"([^"]*)" should be in my list of reports$/, function(reportName) {
    assert.include(
      _.invoke(this.reportManager.getReports(), 'getName'),
      reportName
    );
  });

  this.Then(/^I should not get issues \[(\d+)\] back$/, function(issues) {
    assert.notInclude(
      this.issues.getIds(),
      issues.replace(/ /g, '').split(',')
    );
  });
};

function toList(items) {
  return items.split(',').map(trim);
}

function trim(str) {
  return str.trim();
}
