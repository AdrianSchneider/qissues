'use strict';

function Type(type) {
  this.getType = function() {
    return type;
  };

  this.toString = function() {
    return type;
  };

  this.serialize = function() {
    return { type: type };
  };
}

Type.unserialize = function(json) {
  return new Type(json.type);
};

module.exports = Type;
