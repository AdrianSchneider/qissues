'use strict';

var _  = require('underscore');
var fs = require('fs');

module.exports = function MemoryStorage() {
  var data = {};

  /**
   * Get a value from local storage
   * @param string key
   * @param mixed defaults
   */
  this.get = function(key, defaults) {
    setTimeout(cleanup, 1000);
    return data[key] || defaults;
  };

  /**
   * Sets a value in local storage
   * @param string key
   * @param mixed value
   */
  this.set = function(key, value) {
    if(value === null || typeof value === 'undefined') {
      delete data[key];
    } else {
      data[key] = value;
    }
  };

  /**
   * Remove an item from storage
   * @param string key
   */
  this.remove = function(key) {
    delete data[key];
  };

  /**
   * Remove multiple items from storage
   * @param array keys
   */
  this.removeMulti = function(keys) {
    _.each(keys, function(key) { delete data[key]; });
  };

  this.keys = function() {
    return Object.keys(data);
  };

  this.serialize = function() {
    return data;
  };

  /**
   * Removes any expired entries
   */
  var cleanup = function() {
    var now = new Date();
    var changes = false;
    _.each(data, function(value, key) {
      if(typeof value.expires !== 'undefined') {
        if(now > new Date(value.expires)) {
          delete data[key];
          changes = true;
        }
      }
    });
  };
};
