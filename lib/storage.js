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
    return data[key] || defaults;
  };

  /**
   * Sets a value in local storage
   * @param string key
   * @param mixed value
   */
  this.set = function(key, value) {
    data[key] = value;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  };
};
