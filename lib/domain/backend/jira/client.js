'use strict';

var _       = require('underscore');
var Promise = require('bluebird');
var request = require('request');

module.exports = function(domain, username, password) {

  this.get = function(path, options) {
    return new Promise(function(resolve, reject) {
      request.get(buildUrl(path), attachOptions(options), function(err, res, body) {
        if(err) return reject(err);
        if(res.statusCode !== 200) return reject(new Error('Received ' + res.statusCode + ' instead of 200'));
        return resolve(body);
      });
    });
  };

  this.post = function(path, data) {
    return new Promise(function(resolve, reject) {
      var opts = attachOptions();
      opts.json = data;
      request.post(buildUrl(path), opts, function(err, res, body) {
        if(err) return reject(err);
        return resolve(body);
      });
    });
  };

  this.put = function(path, data) {
    return new Promise(function(resolve, reject) {
      var opts = attachOptions();
      opts.json = data;
      request.put(buildUrl(path), data, function(err, res, body) {
        if(err) return reject(err);
        return resolve(body);
      });
    });

  };

  this.del = function(path) {
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
