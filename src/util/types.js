'use strict';

var _ = require('underscore');
var types = module.exports = {

  allTypeOf: function(collection, type) {
    if(!Array.isArray(collection)) return false;
    return _.all(collection, types.typeof(type));
  },

  typeof: function(type) {
    return function(item) {
      if(type === String) return typeof item === 'string';
      return item instanceof type;
    };
  }
};
