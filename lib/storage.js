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
    data[key] = value;
    writeToDisc();
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
