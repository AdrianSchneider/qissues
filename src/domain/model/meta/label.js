'use strict';

function Label(id, name) {

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

Label.unserialize = function(json) {
  return new Label(json.id, json.name);
};

module.exports = Label;
