'use strict';

var _       = require('underscore');
var sprintf = require('util').format;

module.exports = function(parser, yamlParser, contentField) {
  if(!contentField) contentField = 'description';

  /**
   * Seeds a YAML front-matter document with data
   *
   * @param {Object}     data
   * @param {Joi.Schema} schema
   * @return {Promise<String>}
   */
  this.seed = function(expectations, values) {
    var data = expectations.getValues(values);
    var template = sprintf(
      "---\n%s---\n%s",
      buildYaml(data),
      data[contentField]
    );

    return expectations.getSuggestions()
      .then(function(suggestions) {
        suggestions.forEach(function(suggestion) {
          var field = suggestion[0];
          var choices = suggestion[1];

          template = template.split('\n').map(function(line) {
            if(line.indexOf(field) === 0) {
              line += ' # [' + choices.map(String).join(', ') + ']';
            }
            return line;
          }).join('\n');
        });
        return template;
      });
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
    return yamlParser.safeDump(_.omit(data, contentField));
  };

};