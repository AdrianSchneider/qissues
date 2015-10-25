'use strict';

var TrackerNormalizer = require('./trackerNormalizer');
var TrackerRepository = require('./trackerRepository');
var TrackerMetadata   = require('./trackerMetadata');

/**
 * Represents a 3rd party issue tracking system
 *
 * @param {TrackerNormalizer} normalizer
 * @param {TrackerRepository} repository
 * @param {TrackerMetadata}   metadata
 */
module.exports = function IssueTracker(normalizer, repository, metadata) {
  if(!(normalizer instanceof TrackerNormalizer)) throw new TypeError('normalizer is not a TrackerNormalizer');
  if(!(repository instanceof TrackerRepository)) throw new TypeError('repository is not a TrackerRepository');
  if(!(metadata   instanceof TrackerMetadata))   throw new TypeError('metadata is not a TrackerMetadata');

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

  /**
   * @return {TrackerMetadata}
   */
  this.getMetadata = function() {
    return metadata;
  };

};
