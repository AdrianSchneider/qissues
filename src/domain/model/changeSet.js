'use strict';

var _     = require('underscore');
var types = require('../../util/types');

/**
 * Represents a changeset to apply to the repository
 *
 * @param {Array<String>} issues - keys/ids
 * @param {Object} changes - key/value pairs
 */
function ChangeSet(issues, changes) {
  if (!types.allTypeOf(issues, String)) {
    throw new TypeError('ChangeSet requires an array of issue ids');
  }

  if (!changes || typeof changes !== 'object' || !Object.keys(changes).length) {
    throw new TypeError('ChangeSet requires an object of changes');
  }

  if (Object.keys(changes).length > 1) {
    throw new Error('Cannot change multiple properties at once yet');
  }

  /**
   * Returns the issues
   *
   * @return {Array<String>}
   */
  this.getIssues = function() {
    return issues;
  };

  /**
   * Returns the changes on those issues
   *
   * @return {Object}
   */
  this.getChanges = function() {
    return _.pairs(changes);
  };

}

/**
 * Create a new changeset iteratively
 *
 * @return {ChangeSetBuilder}
 */
ChangeSet.create = function() {
  return new ChangeSetBuilder();
};

/**
 * Mutable changeset builder to add things peicemeal
 */
function ChangeSetBuilder() {
  var issues = [];
  var changes = {};

  /**
   * Adds an issue
   *
   * @param {String} issue - id
   * @return {ChangeSetBuilder} - chainable
   */
  this.addIssue = function(issue) {
    issues = _.uniq(issues.concat([issue]));
    return this;
  };

  /**
   * Adds many issues
   *
   * @param {Array<String>} issues - keys/ids
   * @return {ChangeSetBuilder} - chainable
   */
  this.addIssues = function(newIssues) {
    issues = _.uniq(issues.concat(newIssues));
    return this;
  };

  /**
   * Adds a specific change
   *
   * @param {String} field
   * @param {*} value
   * @return {ChangeSetBuilder} - chainable
   */
  this.addChange = function(field, value) {
    changes[field] = value;
    return this;
  };

  /**
   * Gets the final changeset
   *
   * @return {ChangeSet}
   */
  this.get = function() {
    return new ChangeSet(issues, changes);
  };
}

module.exports = ChangeSet;
