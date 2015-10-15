'use strict';

var _               = require('underscore');
var joi             = require('joi');
var Promise         = require('bluebird');
var ValidationError = require('../../errors/validation');

/**
 * Defines a tracker's expectations from the user at a given point in time
 *
 * @param {Object} schemaDefinition
 *
 *   {
 *      fieldName: { type: string, required: bool, default: mixed, choices: Promise }
 *   }
 */
module.exports = function Expectations(schemaDefinition) {

  /**
   * Gets the initial values for the user to edit
   *
   * @param {Object} overrideValues
   * @return {Object} key/value pairs
   */
  this.getValues = function(overrideValues) {
    return _.extend(
      _.mapObject(schemaDefinition, function(v) { return v.default; }),
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
      .filter(Object.keys(schemaDefinition), function(field) {
        return !!schemaDefinition[field].choices;
      })
      .map(function(field) {
        return schemaDefinition[field].choices.then(function(choices) {
          return [field, choices];
        });
      });
  };

  /**
   * Throws a ValidationError when the incoming data does not match the schema
   *
   * @param {Object} data - user input
   * @return {Promise<Object>} data - user input
   * @throws {ValidationError} when invalid
   */
  this.ensureValid = function(data) {
    return objectSchemaToJoi(schemaDefinition)
      .then(function(schema) {
        var result = joi.validate(data, schema);
        if (result.error) throw new ValidationError(result.error.message);
        return data;
      });

  };

  /**
   * Converts the schema into a joi schema
   *
   * @return {Joi.Schema}
   */
  var objectSchemaToJoi = function() {
    return Promise
      .map(Object.keys(schemaDefinition), fieldSchemaToJoi)
      .then(function(data) {
        return data;
      })
      .reduce(function(out, field) {
        out[field[0]] = field[1];
        return out;
      }, {})
      .then(function(fields) {
        return joi.object(fields);
      });
  };

  /**
   * Promises the schema field as a joi schema
   *
   * @return {Promise<Joi.Schema>}
   */
  var fieldSchemaToJoi = function(fieldName) {
    var field = schemaDefinition[fieldName];
    var node = joi[field.type]();

    if (field.required) {
      node = node.required();
    } else {
      node = node.allow('');
    }

    if (field.default)  {
      node = node.default(field.default);
    }

    if (field.choices) {
      return field.choices.then(function(choices) {
        node.valid(choices.map(String));
        return [fieldName, node];
      });
    }

    return [fieldName, node];
  };

};
