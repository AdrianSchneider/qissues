'use strict';

function Type(id, type) {

  this.getId = function() {
    return id;
  };

  this.getType = function() {
    return type;
  };

  this.toString = function() {
    return id || type;
  };

  this.serialize = function() {
    return {
      id: id,
      type: type
    };
  };
}

Type.unserialize = function(json) {
  return new Type(json.id, json.type);
};

module.exports = Type;
