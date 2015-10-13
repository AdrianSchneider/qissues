'use strict';

var sprintf = require('util').format;

module.exports = function(parser, yamlParser, contentField) {
  if(!contentField) contentField = 'description';

  /**
   * Seeds a YAML front-matter document with data
   *
   * @param {Object}     data
   * @param {Joi.Schema} schema
   * @return {String}
   */
  this.seed = function(expectations, values) {
    var data = expectations.getValues(values);
    return sprintf(
      "---\n%s---\n%s",
      buildYaml(data),
      data[contentField]
    );
  };

  /**
   * Parses data from a YAML front-matter document
   *
   * @param {String} str - input
   * @return {Object}
   */
  this.parse = function(str) {
    return parser.parse(str, contentField);
  };

  var buildYaml = function(data) {
    return yamlParser.safeDump(data);
  };

};
