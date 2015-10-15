'use strict';

var User     = require('./meta/user');
var Label    = require('./meta/label');
var Priority = require('./meta/priority');
var Sprint   = require('./meta/sprint');
var Type     = require('./meta/type');
var Project  = require('./meta/project');

/**
 * Represents a new issue being persisted to a 3rd party issue tracker
 *
 * @param {String} title
 * @param {String} description
 * @param {Object} attributes
 */
module.exports = function NewIssue(title, description, attributes) {
  if(!attributes) attributes = {};
  var construct = function() {
    var attributeFunctions = {
      assignee: setAssignee,
      sprint: setSprint,
      type: setType,
      priority: setPriority,
      project: setProject
    };

    Object.keys(attributes).forEach(function(attribute) {
      if(typeof attributeFunctions[attribute] === 'undefined') {
        throw new ReferenceError(attribute + ' is not a valid NewIssue attribute');
      }

      attributeFunctions[attribute](attributes[attribute]);
    });
  };


  var setAssignee = function(user) {
    if(!(user instanceof User)) throw new TypeError('assignee must be a valid User');
    attributes.assignee = user;
  };

  var setSprint = function(sprint) {
    if(!(sprint instanceof Sprint)) throw new TypeError('sprint must be a valid Sprint');
    attributes.sprint = sprint;
  };

  var setType = function(type) {
    if(!(type instanceof Type)) throw new TypeError('type must be a valid Type');
    attributes.type = type;
  };

  var setPriority = function(priority) {
    if(!(priority instanceof Priority)) throw new TypeError('priority must be a valid Priority');
    attributes.priority = priority;
  };

  var setProject = function(project) {
    if(!(project instanceof Project)) throw new TypeError('project must be a valid Project');
    attributes.project = project;
  };


  this.getTitle = function() {
    return title;
  };

  this.getDescription = function() {
    return description;
  };

  this.serialize = function() {
    return {
      title: title,
      description: description,
      attributes: attributes
    };
  };

  this.get = function(field) {
    //if(!this.has(field)) throw new ReferenceError(field + ' is not an existing attribute');
    return attributes[field];
  };

  this.has = function(field) {
    return typeof attributes[field] !== 'undefined';
  };

  construct();

};
