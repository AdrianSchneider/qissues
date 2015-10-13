'use strict';

module.exports = function Status(status) {

  this.getStatus = function() {
    return status;
  };

  this.toString = function() {
    return status;
  };

};
