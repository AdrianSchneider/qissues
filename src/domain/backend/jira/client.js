'use strict';

var _       = require('underscore');
var Promise = require('bluebird');
var request = require('request');
var ValidationError = require('../../errors/validation');

module.exports = function JiraHttpClient(domain, username, password, logger) {

  /**
   * Performs a GET request
   *
   * @param {String} path
   * @param {Object} options
   * @return {Promise}
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

  var buildUrl = function(path) {
    return "https://" + domain + path;
  };

  var attachOptions = function(options) {
    var opts = _.clone(options || {});
    opts.json = true;
    opts.auth = { username: username, password: password };

    return opts;
  };

};
