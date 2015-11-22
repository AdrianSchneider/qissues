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
    return (new Promise(function(resolve, reject) {
      fs.exists(filename, function(exists) {
        if (exists) return resolve();
        fs.writeFile(filename, '{}', function(err) {
          if (err) return reject(err);
          resolve();
        });
      });
    }))
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
  this.get = function(key, def) {
    if (!config) {
      throw new ReferenceError('Config is not loaded yet');
    }

    if (typeof config[key] === 'undefined') {
      if (typeof def === 'undefined') {
        throw new ReferenceError('Config key ' + key + ' does not exist');
      }
      return def;
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
    config = options;
    return fs.writeFileAsync(filename, JSON.stringify(options, null, 4));
  };

  /**
   * Exports the raw config values
   *
   * @return {Object}
   * @throws {ReferenceError} when thrown before its loaded
   */
  this.serialize = function() {
    if (!config) {
      throw new ReferenceError('Config is not loaded yet');
    }

    return config;
  };

};
