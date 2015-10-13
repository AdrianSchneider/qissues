'use strict';

module.exports = function Priority(priority, name) {

  this.getPriority = function() {
    return priority;
  };

  this.getName = function() {
    return name;
  };

  this.toString = function() {
    return name || priority;
  };

};
