'use strict';

var _       = require('underscore');
var Promise = require("bluebird");

/**
 * Application container for storing services
 *
 * @param {Object} initialServices
 */
module.exports = function Container() {
  var registered = {};
  var readyServices = {};
  var container = this;

  /**
   * Registers a service
   *
   * @param {String} name
   * @param {Promise} promisedService
   * @param {Array<Promise>} dependencies
   */
  this.registerService = function(name, f, dependencies) {
    if (typeof f !== 'function') throw new TypeError('Service ' + name + 's builder function is not callable');

    if (typeof registered[name] !== 'undefined') {
      throw new Error('Cannot replace existing service ' + name);
    }

    registered[name] = {
      f: f,
      dependencies: dependencies || []
    };
  };

  /**
   * Returns the promise of a service, while resolving the dependency tree
   *
   * @param {String} name
   * @return {Promise} resolved service
   */
  this.get = function(serviceName) {
    if (typeof registered[serviceName] === 'undefined') {
      throw new ReferenceError('Cannot get undefined service ' + serviceName);
    }
    if (typeof readyServices[serviceName] !== 'undefined') {
      return Promise.resolve(readyServices[serviceName]);
    }

    var definition = registered[serviceName];
    definition.f = _.once(definition.f);

    return Promise
      .map(definition.dependencies, function(dependency) {
        return container.get(dependency);
      })
      .then(function(dependencies) {
        return definition.f.apply(definition.f, dependencies);
      })
      .then(function(readyService) {
        readyServices[serviceName] = readyService;
        return readyService;
      });
  };

  /**
   * Gets mutiple keys at once, as an array
   * @param {Array<String>} service names
   * @return {Promise<Array>}
   */
  this.getMatching = function(keys) {
    return Promise.map(keys, this.get);
  };

  /**
   * Lists all of the services in the container
   */
  this.listServices = function(except) {
    if(!except) except = [];
    return Object.keys(registered).filter(function(name) {
      return except.indexOf(name) === -1;
    });
  };

};
