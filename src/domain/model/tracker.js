'use strict';

var TrackerNormalizer = require('./trackerNormalizer');
var TrackerRepository = require('./trackerRepository');

/**
 * Represents a 3rd party issue tracking system
 *
 * @param {TrackerNormalizer} normalizer
 * @param {TrackerRepository} repository
 */
module.exports = function IssueTracker(normalizer, repository) {
  if(!(normalizer instanceof TrackerNormalizer)) throw new TypeError('normalizer is not a TrackerNormalizer');
  if(!(repository instanceof TrackerRepository)) throw new TypeError('repository is not a TrackerRepository');

  /**
   * @return {TrackerNormalizer}
   */
  this.getNormalizer = function() {
    return normalizer;
  };

  /**
   * @return {TrackerRepository}
   */
  this.getRepository = function() {
    return repository;
  };

};
