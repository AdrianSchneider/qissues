'use strict';

module.exports = function FrontMatterParser(yaml) {

  /**
   * Takes a front-matter yaml string and
   * returns an object of data
   *
   * @param {String} content
   * @param {String} mainField - for body
   * @return {Object}
   */
  this.parse = function(content, mainField) {
    var parts = split(content);
    var metadata = parts[0];
    var body = parts[1];
    var out;

    try {
      out = yaml.safeLoad(metadata);
    } catch (e) {
      throw new Error('Content metadata is not valid YAML: ' + e.message);
    }

    out[mainField] = body;
    return out;
  };

  /**
   * Separate the YAML from the main body
   *
   * @param {String} Input
   * @return {Array<String>} (yaml, body)
   */
  var split = function(input) {
    var parts = input.split('---');
    if(parts.length != 3) {
      throw new Error('Content requires ---YAML---BODY');
    }

    return parts.slice(-2).map(function(part) {
      return part.trim();
    });
  };

};
