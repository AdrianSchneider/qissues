'use strict';

var _        = require('underscore');
var defaults = require('./keys.defaults.json');

module.exports = function(config) {
  return _.extend(defaults, config.keys || {});
};
