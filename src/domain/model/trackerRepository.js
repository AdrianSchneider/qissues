'use strict';

/**
 * Example repository for backends to implement
 */
module.exports = function Repository() {

  /**
   * Creates a new issue on jira
   *
   * @param {NewIssue} newIssue
   * @return {Promise<Issue>}
   */
  this.create = function(newIssue) {
    throw new Error('Repository must implement create');
  };

  /**
   * Fetches an issue by its number
   *
   * @param {Report} report
   * @param {Boolean} invalidate - bypass cache
   * @return {Promise<IssuesCollection>} - promised array of issues
   */
  this.lookup = function(num, invalidate) {
    throw new Error('Repository must implement create');
  };

  /**
   * Fetches issues using a query
   *
   * @param {Report} report
   * @param {Boolean} invalidate - bypass cache
   * @return {Promise<IssuesCollection>} - promised array of issues
   */
  this.query = function(report, invalidate) {
    throw new Error('Repository must implement create');
  };

};
