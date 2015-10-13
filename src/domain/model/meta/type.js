'use strict';

module.exports = function Type(type) {

  this.getType = function() {
    return type;
  };

  this.toString = function() {
    return type;
  };

};
