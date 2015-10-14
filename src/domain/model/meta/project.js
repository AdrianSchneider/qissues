'use strict';

function Project(id, name) {

  this.getId = function() {
    return id;
  };

  this.getName = function() {
    return name;
  };

  this.serialize = function() {
    return {
      id: id,
      name: name
    };
  };

}

Project.unserialize = function(json) {
  return new Project(json.id, json.name);
};

module.exports = Project;
