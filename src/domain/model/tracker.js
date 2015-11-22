'use strict';

var TrackerNormalizer = require('./trackerNormalizer');
var TrackerRepository = require('./trackerRepository');
var TrackerMetadata   = require('./trackerMetadata');
var Expectations      = require('./expectations');
var ValidationError   = require('../errors/validation');
var MoreInfoRequired  = require('../errors/infoRequired');

/**
 * Represents a 3rd party issue tracking system
 *
 * @param {TrackerNormalizer} normalizer
 * @param {TrackerRepository} repository
 * @param {TrackerMetadata}   metadata
 */
module.exports = function IssueTracker(normalizer, repository, metadata, configExpectations) {
  if(!(normalizer           instanceof TrackerNormalizer)) throw new TypeError('normalizer is not a TrackerNormalizer');
  if(!(repository           instanceof TrackerRepository)) throw new TypeError('repository is not a TrackerRepository');
  if(!(metadata             instanceof TrackerMetadata))   throw new TypeError('metadata is not a TrackerMetadata');
  if(!(configExpectations   instanceof Expectations))      throw new TypeError('configExpectations is not an Expectations');

  /**
   * Checks to see if the loaded configuration is valid for this tracker
   * Throws an exception to prompt for more information when it isn't
   *
   * @param {Object} config
   * @return {Promise}
   * @throws {MoreInfoRequired}
   */
  this.assertConfigured = function(config) {
    return configExpectations.ensureValid(config)
      .catch(ValidationError, function(err) {
        throw new MoreInfoRequired(err.message, configExpectations);
      });
  };

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
