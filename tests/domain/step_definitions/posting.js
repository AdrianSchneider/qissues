'use strict';

var _       = require('underscore');
var assert  = require('chai').assert;
var f       = require('../../../src/util/f');

module.exports = function() {

  this.When(/^I go to create an issue$/, function() {
    this.requirements = this.normalizer.getNewIssueRequirements();
  });

  this.Then(/^I should get prompted for:$/, function (table) {
    var requirements = this.requirements.serialize();
    table.hashes().forEach(function(field) {
      if (!requirements[field.field]) throw new Error('Could not find ' + field.field);

      assert.equal(
        requirements[field.field].required ? 'yes' : 'no',
        field.required
      );

      if (requirements[field.field].choices) {
        assert.deepEqual(
          requirements[field.field].choices.map(String).sort(),
          field.options.split(',').map(function(f) { return f.trim(); })
        );
      }
    });
  });

  this.When(/^I submit the following issue:$/, function(table) {
    return this.repository.createIssue(this.normalizer.toNewIssue(table.rowsHash()))
      .then(f.tee(this, 'id'));
  });

  this.Then(/^the issue should be persisted$/, function() {
    return this.repository.lookup(this.id)
      .then(f.tee(this, 'issue'));
  });

  this.Then(/^the "([^"]*)" should equal "([^"]*)"$/, function (field, expected) {
    var value;
    if (this.issue.get(field)) {
      value = this.issue.get(field).toString();
    } else {
      value = this.issue['get' + field[0].toUpperCase() + field.slice(1)];
    }

    assert.equal(value || "", expected || "");
  });

  this.Then(/^the issue should fail to post$/, function (callback) {
    // Write code here that turns the phrase above into concrete actions
    callback.pending();
  });

};
