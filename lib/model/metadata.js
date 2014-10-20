var _               = require('underscore');
var ValidationError = require('../errors/validation');

module.exports = function Metadata(metadata) {
  /**
   * Find a project given a partial name
   * @param string name
   * @return object
   */
  metadata.matchProject = function(name) {
    var project = _.find(metadata.projects, matchField(name, ['key', 'name']));
    if(!project) throw new ValidationError(name + ' is not a valid project');
    return project;
  };

  /**
   * Find a user given a partial name
   * @param string name
   * @return object
   */
  metadata.matchUser = function(name) {
    var user = _.find(metadata.users, matchField(name, ['name']));
    if(!user) throw new ValidationError(name + ' is not a valid user');
    return user;
  };

  /**
   * Find a type given a partial name
   * @param string name
   * @return object
   */
  metadata.matchType = function(type) {
    var issuetype = _.find(metadata.types, matchField(type, ['name']));
    if(!issuetype) throw new ValidationError(type + ' is not a valid type');
    return issuetype;
  };

  /**
   * Find a sprint given a partial name
   * @param string name
   * @return object
   */
  metadata.matchSprint = function(name) {
    var sprint = _.find(metadata.sprints, matchField(name, ['name']));
    if(!sprint) throw new ValidationError(name + ' is not a valid sprint');
    return sprint;
  };

  /**
   * Returns a function which fuzzy matches text based on a specific field
   *
   * @param string text to match
   * @param array  fields
   * @return boolean
   */
  var matchField = function(text, fields) {
    return function(doc) {
      if(typeof doc === 'string') {
        return doc.toLowerCase().indexOf(text.toLowerCase()) !== -1;
      }

      for (var i in fields) {
        if(doc[fields[i]].toLowerCase().indexOf(text.toLowerCase()) !== -1) {
          return true;
        }
      }

      return false;
    };
  };

  return metadata;
};
