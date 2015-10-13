'use strict';

var Promise = require('bluebird');

/**
 * Metadata for JIRA
 * All metadata is lazy-loaded, cached, and returned as Promises
 *
 * @param {Storage} storage
 */
module.exports = function JiraMetadata(storage) {

  /**
   * Fetches the available types in Jira
   *
   * @return {Promise<Array><Type>}
   */
  this.getTypes = function() {
    return Promise.resolve([]);
  };

  /**
   * Fetches the available users in Jira
   *
   * @return {Promise<Array><User>}
   */
  this.getUsers = function() {
    return Promise.resolve([]);
  };

  /**
   * Fetches the available sprints in Jira
   *
   * @return {Promise<Array><Sprint>}
   */
  this.getSprints = function() {
    return Promise.resolve([]);
  };

  this.getLabels = function() {
    return Promise.resolve([]);
  };

  this.getProjects = function() {
    return Promise.resolve([]);
  };

  this.getViews = function() {
    return Promise.resolve([]);
  };

  this.getStatuses = function() {
    return Promise.resolve([]);
  };

};
