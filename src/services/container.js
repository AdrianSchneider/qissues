'use strict';

/**
 * Application container for storing services
 *
 * @param {Object} initialServices
 */
module.exports = function Container(initialServices) {
  var services = initialServices || {};

  /**
   * Sets a service
   *
   * @param {String} name
   * @param {*} service
   */
  this.set = function(name, service) {
    if (typeof services[name] !== 'undefined') {
      throw new Error('Cannot replace existing service ' + name);
    }

    services[name] = service;
  };

  /**
   * Gets a service
   *
   * @param {String} name
   * @return {*} - the service
   */
  this.get = function(name) {
    if (typeof services[name] === 'undefined') {
      throw new ReferenceError('Cannot get undefined service ' + name);
    }

    return services[name];
  };

};
