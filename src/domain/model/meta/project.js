'use strict';

function Project(id, name, internalId) {

  this.getId = function() {
    return id;
  };

  this.getName = function() {
    return name;
  };

  this.toString = function() {
    return id;
  };

  this.getInternalId = function() {
    return internalId;
  };

  this.serialize = function() {
    return {
      id: id,
      name: name,
      internalId: internalId
    };
  };

}

Project.unserialize = function(json) {
  return new Project(json.id, json.name, json.internalId);
};

module.exports = Project;
