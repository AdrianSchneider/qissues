var _  = require('underscore');
var fs = require('fs');

module.exports = function Storage(filename) {
  if(!fs.existsSync(filename)) {
    fs.writeFileSync(filename, '{}');
  }

  var data = require(filename);

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

    writeToDisc();
  };

  /**
   * Remove an item from storage
   * @param string key
   */
  this.remove = function(key) {
    delete data[key];
    writeToDisc();
  };

  /**
   * Remove multiple items from storage
   * @param array keys
   */
  this.removeMulti = function(keys) {
    _.each(keys, function(key) { delete data[key]; });
    if(keys.length) writeToDisc();
  };

  this.keys = function() {
    return Object.keys(data);
  };

  this.serialize = function() {
    return data;
  };

  /**
   * Writes in-memory data to disc
   */
  var writeToDisc = function() {
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
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

    writeToDisc();
  };
};
