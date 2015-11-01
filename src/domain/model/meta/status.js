'use strict';

function Status(status) {

  this.getStatus = function() {
    return status;
  };

  this.toString = function() {
    return status;
  };

  this.serialize = function() {
    return { status: status };
  };

}

Status.unserialize = function(json) {
  return new Status(json.status);
};

module.exports = Status;
