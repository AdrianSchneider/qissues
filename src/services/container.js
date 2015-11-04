'use strict';

var Promise = require("bluebird");

/**
 * Application container for storing services
 *
 * @param {Object} initialServices
 */
module.exports = function Container(initialServices) {
  var services = initialServices || {};
  var container = this;

  /**
   * Registers a service
   *
   * @param {String} name
   * @param {Promise} promisedService
   * @param {Array<Promise>} dependencies
   */
  this.registerService = function(name, promisedService, dependencies) {
    if (typeof services[name] !== 'undefined') {
      throw new Error('Cannot replace existing service ' + name);
    }

    this.services[name] = {
      promise: promisedService.bind(container),
      dependencies: dependencies || []
    };
  };

  /**
   * Returns the promise of a service, while resolving the dependency tree
   */
  this.get = function(serviceName) {
    if (typeof services[serviceName] === 'undefined') {
      throw new ReferenceError('Cannot get undefined service ' + serviceName);
    }

    var service = services[serviceName];
    return Promise.all(service.dependencies).then(function() {
      return service.promise;
    });
  };

  /**
   * Lists all of the services in the container
   */
  this.listServices = function(except) {
    if(!except) except = [];
    return Object.keys(services).filter(function(name) {
      return except.indexOf(name) === -1;
    });
  };

};
