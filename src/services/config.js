'use strict';

var Promise = require('bluebird');

module.exports = function Config(filename, fs) {
  var config;
  if(!fs) fs = Promise.promisifyAll(require('fs'));

  /**
   * Ensures config is loaded, returning expected config
   *
   * @return {Promise<Expectations>}
   */
  this.initialize = function() {
    return fs.existsAsync(filename)
      .then(function(exists) {
        return !exists ? fs.writeFileAsync(filename, '{}') : null;
      })
      .then(function() {
        return require(filename);
      })
      .then(function(configData) {
        config = configData;
      });
  };

  /**
   * Fetches a config option
   *
   * @param {String} key
   * @return {*}
   * @throws {ReferenceError}
   */
  this.get = function(key) {
    if (!config) {
      throw new ReferenceError('Config is not loaded yet');
    }

    if (typeof config[key] === 'undefined') {
      throw new ReferenceError('Config key ' + key + ' does not exist');
    }

    return config[key];
  };

  /**
   * Updates the config
   *
   * @param {Object} options - new config values
   * @return {Promise}
   */
  this.save = function(options) {
    return fs.writeFileAsync(filename, JSON.stringify(options, null, 4));
  };

};
