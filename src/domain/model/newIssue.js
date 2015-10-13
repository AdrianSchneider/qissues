'use strict';

var _ = require('underscore');

/**
 * Represents a new issue being persisted to an issue backend
 */
module.exports = function NewIssue(project, title, description, type, attributes) {
  if(!attributes) attributes = {};

  this.serialize = function() {
    return _.extend(
      {},
      attributes,
      { project: project, title: title, description: description, type: type }
    );
  };

};
