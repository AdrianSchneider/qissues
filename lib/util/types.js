'use strict';

var _ = require('underscore');
var types = module.exports = {

  allTypeOf: function(collection, type) {
    return _.all(collection, types.typeof(type));
  },

  typeof: function(type) {
    return function(item) {
      return item instanceof type;
    };
  }
};
