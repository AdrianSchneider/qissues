'use strict';

var _       = require('underscore');
var expect  = require('chai').expect;
var Promise = require('bluebird');
var Filter  = require('../../../src/domain/model/filter');

module.exports = function() {

  /**
   * Empties the repository and adds new issues
   */
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
    var context = this;
    var report = this.reportManager.getDefault();
    return this.repository.query(report).then(function(issues) {
      context.issues = issues;
      return issues;
    });
  });

  this.When(/^I activate the "([a-z]+)" report$/, function(reportName) {
    this.reportManager.getDefault().replaceFilters(
      this.reportManager.get(reportName).getFilters()
    );
  });

  this.Then(/^I should get issues \[([, 0-9]+)\] back$/, function(issues) {
    var expected = issues.replace(/ /g, '').split(',').sort();
    var found = this.issues.getIds().sort();
    expect(found).to.deep.equal(expected);
  });

  this.Given(/^no issues$/, function() {
    this.repository.empty();
  });

  this.Given(/^the following users: ([ ,a-z]+)$/, function(users) {
    var trim = function(s) { return s.trim(); };
    this.metadata.setUsers(users.split(',').map(trim));
  });

  this.Given(/^the following types: ([ ,a-z]+)$/i,function(types) {
    var trim = function(s) { return s.trim(); };
    this.metadata.setTypes(types.split(',').map(trim));
  });

  this.Given(/^the following projects: ([ ,a-z]+)$/i, function(projects) {
    var trim = function(s) { return s.trim(); };
    this.metadata.setProjects(projects.split(',').map(trim));
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

  this.Then(/^"([^"]*)" should be in my list of reports$/, function(reportName) {
    expect(_.invoke(this.reportManager.getReports(), 'getName')).to.contain(reportName);
  });

  this.Then(/^I should not get issues \[(\d+)\] back$/, function(issues) {
    var expected = issues.replace(/ /g, '').split(',').sort();
    var found = this.issues.getIds().sort();
    expect(this.issues.getIds()).to.not.contain(expected);
  });
};
