var moment = require('moment');
var crypto = require('crypto');

module.exports = function Cache(storage) {
  var prefix = 'cache:';

  /**
   * Generate a unique ID for a given string
   * @param string str
   */
  this.key = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
  };

  /**
   * Attempt to get an item from cache
   *
   * @param string key
   * @param boolean invalidate 
   */
  this.get = function(key, invalidate) {
    if(invalidate) return;
    var entry = storage.get(prefix + key);
    if(entry && new Date(entry.expires) > new Date()) {
      return entry.data;
    }
  };

  /**
   * Set an item in cache
   */
  this.set = function(key, data, ttl) {
    storage.set(prefix + key, {
      data: data,
      expires: moment().add(ttl || 3600, 'seconds')
    });
  };

  /**
   * Purges expired entries from the cache
   */
  this.clean = function() {
    var now = new Date();
    var expired = [];

    storage.keys().filter(function(key) {
      return key.indexOf(prefix) === 0;
    }).forEach(function(key) {
      var value = storage.get(key);
      if(now > new Date(value.expires)) {
        expired.push(key.substr(prefix.length));
      }
    });

    storage.removeMulti(expired);
  };
};