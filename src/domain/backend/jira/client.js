'use strict';

var _       = require('underscore');
var Promise = require('bluebird');
var request = require('request');
var ValidationError = require('../../errors/validation');

/**
 * Interacts with Jira's REST API
 *
 * @param {Config} config
 * @param {winston.Logger} logger
 */
module.exports = function JiraHttpClient(config, logger) {

  var configured = false;

  /**
   * Performs a GET request
   *
   * @param {String} path
   * @param {Object} options
   * @return {Promise<Object>}
   */
  this.get = function(path, options) {
    logger.trace('http request: GET ' + buildUrl(path));

    return new Promise(function(resolve, reject) {
      request.get(buildUrl(path), attachOptions(options), function(err, res, body) {
        if(err) return reject(err);
        if(res.statusCode !== 200) return reject(new Error('Received ' + res.statusCode + ' instead of 200 (url = ' + path + ')'));
        return resolve(body);
      });
    });
  };

  /**
   * Performs a POST request
   *
   * @param {String} path
   * @param {Object} data
   * @return {Promise<Object>}
   */
  this.post = function(path, data) {
    logger.trace('http request: POST ' + buildUrl(path));

    return new Promise(function(resolve, reject) {
      var opts = attachOptions();
      opts.json = data;
      request.post(buildUrl(path), opts, function(err, res, body) {
        if(err) return reject(err);
        if(res.statusCode === 400) {
          return reject(new ValidationError(JSON.stringify(body)));
        }
        return resolve(body);
      });
    });
  };

  /**
   * Performs a PUT request
   *
   * @param {String} path
   * @param {Object} data
   * @return {Promise<Object>}
   */
  this.put = function(path, data) {
    logger.trace('http request: PUT ' + buildUrl(path));

    return new Promise(function(resolve, reject) {
      var opts = attachOptions();
      opts.json = data;
      request.put(buildUrl(path), opts, function(err, res, body) {
        if(err) return reject(err);
        logger.trace('http response ' + res.statusCode);
        logger.trace('http payload ' + JSON.stringify(body, null, 4));
        return resolve(body);
      });
    });

  };

  /**
   * Performs a DELETE request
   * @param {String} path
   * @return {Promise}
   */
  this.del = function(path) {
    logger.trace('http request: DELETE ' + buildUrl(path));

    return new Promise(function(resolve, reject) {
      var opts = attachOptions();
      request.del(buildUrl(path), function(err, res, body) {
        if(err) return reject(err);
        return resolve(body);
      });
    });
  };

  /**
   * Constructs a fully qualified URL
   */
  var buildUrl = function(path) {
    return "https://" + config.get('domain') + path;
  };

  /**
   * Constructs the authentication to the options object for the request
   *
   * @param {Object} options
   * @return {Object}
   */
  var attachOptions = function(options) {
    var opts = _.clone(options || {});
    opts.json = true;
    opts.auth = { username: config.get('username'), password: config.get('password') };

    return opts;
  };

};
