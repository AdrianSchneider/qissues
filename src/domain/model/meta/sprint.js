'use strict';

module.exports = function Sprint(id, name) {

  this.getId = function() {
    return id;
  };

  this.getName = function() {
    return name;
  };

  this.toString = function() {
    return name;
  };


};
