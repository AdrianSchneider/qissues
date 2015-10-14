'use strict';

var _               = require('underscore');
var joi             = require('joi');
var Promise         = require('bluebird');
var ValidationError = require('../../errors/validation');

module.exports = function Expectations(schema) {

  /**
   * Gets the initial values for the user to edit
   *
   * @param {Object} overrideValues
   * @return {Object} key/value pairs
   */
  this.getValues = function(overrideValues) {
    return _.extend(
      _.mapObject(schema, function(v) { return v.default; }),
      overrideValues || {}
    );
  };

  /**
   * Gets the suggestions from these expectations
   *
   * @return {Array}
   */
  this.getSuggestions = function() {
    return Promise
      .filter(Object.keys(schema), function(field) {
        return !!schema[field].choices;
      })
      .map(function(field) {
        return schema[field].choices.then(function(choices) {
          return [field, choices];
        });
      });
  };

  this.ensureValid = function(data) {
    var result = joi.validate(data, objectSchemaToJoi(schema));
    if (result.error) throw new ValidationError(result.error.message);
    return data;
  };

  var objectSchemaToJoi = function() {
    return joi.object(_.mapObject(schema, fieldSchemaToJoi));
  };

  var fieldSchemaToJoi = function(field) {
    var node = joi[field.type]();

    if (field.required) {
      node = node.required();
    } else {
      node = node.allow('');
    }

    if (field.default)  node = node.default(field.default);

    return node;
  };

};
