'use strict';

var _               = require('underscore');
var joi             = require('joi');
var Promise         = require('bluebird');
var ValidationError = require('../../errors/validation');

/**
 * Defines a tracker's expectations from the user at a given point in time
 *
 * @param {Object} schema
 *
 *   {
 *      fieldName: { type: string, required: bool, default: mixed, choices: Promise }
 *   }
 */
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

  /**
   * Throws a ValidationError when the incoming data does not match the schema
   *
   * @param {Object} data - user input
   * @return {Object} data - user input
   * @throws {ValidationError} when invalid
   */
  this.ensureValid = function(data) {
    var result = joi.validate(data, objectSchemaToJoi(schema));
    if (result.error) throw new ValidationError(result.error.message);
    return data;
  };

  /**
   * Converts the schema into a joi schema
   *
   * @return {Joi.Schema}
   */
  var objectSchemaToJoi = function() {
    return joi.object(_.mapObject(schema, fieldSchemaToJoi));
  };

  /**
   * Returns the schema field as a joi schema
   *
   * @return {Joi.Schema}
   */
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
