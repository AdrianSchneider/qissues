'use strict';

module.exports = function Label(id, name) {

  this.getId = function() {
    return id;
  };

  this.getName = function() {
    return name;
  };

};
