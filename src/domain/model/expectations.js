'use strict';

var _ = require('underscore');

module.exports = function Expectations(schema) {

  this.getValues = function(overrideValues) {
    return _.extend(
      _.mapObject(schema, function(v) { return v.default; }),
      overrideValues || {}
    );
  };

};
