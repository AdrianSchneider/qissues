'use strict';

var Promise = require('bluebird');

module.exports = {

  /**
   * Returns a function which copies its input to data[key] before sending it out again
   *
   * @param {Object} data - object to mutate
   * @param {String} key - key to mutate in object
   * @return {Function} to continue promise chain
   */
  tee: function(data, key) {
    return function(input) {
      data[key] = input;
      return Promise.resolve(input);
    };
  },

  /**
   * Prepends text before a list of options once they resolve
   *
   * @param {Function} getOptions - returns promise of options
   * @param {String} prependedOption
   * @return {Function} - returning {Promise<Array>}
   */
  prepend: function(getOptions, prependedOption) {
    return function() {
      return getOptions().then(function(options) {
        return [prependedOption].concat(options);
      });
    };
  }

};
