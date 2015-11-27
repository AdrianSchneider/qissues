'use strict';

var _      = require('underscore');
var expect = require('chai').expect;
var Promise = require('bluebird');
var Filter = require('../../../src/domain/model/filter');

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

  this.Given(/^I filter "([^"]*)" by "([^"]*)"$/, function(field, value) {
    this.reportManager.getDefault().getFilters().add(new Filter(field, value));
  });

  this.Given(/^I have the following reports\:$/, function(table, callback) {
    callback.pending();
  });

  this.When(/^I query issues$/, function() {
    var context = this;
    var report = this.reportManager.getDefault();
    return this.repository.query(report).then(function(issues) {
      context.issues = issues;
      return issues;
    });
  });

  this.When(/^I activate the "([a-z]+)" report$/, function(reportName, callback) {
    callback.pending();
  });

  this.Then(/^I should get issues \[([, 0-9]+)\] back$/, function(issues) {
    var expected = issues.replace(/ /g, '').split(',').sort();
    var found = this.issues.getIds().sort();
    expect(found).to.deep.equal(expected);
  });

  this.Given(/^no issues$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Given(/^the following users: adrian$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Given(/^the following types: bug, improvement$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Given(/^the following projects: DEV$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
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

  this.Given(/^I save the report as "([^"]*)"$/, function (arg1, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.When(/^I list reports$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Then(/^I should see "([^"]*)" in the list$/, function (arg1, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

  this.Then(/^I should not get issues \[(\d+)\] back$/, function (arg1, callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });
};
