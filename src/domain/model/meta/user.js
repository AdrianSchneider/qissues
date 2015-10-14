'use strict';

function User(account, id, name) {

  this.getAccount = function() {
    return account;
  };

  this.getId = function() {
    return id;
  };

  this.getName = function() {
    return name;
  };

  this.toString = function() {
    return name || account;
  };

  this.serialize = function() {
    return {
      account: account,
      id: id,
      name: name
    };
  };

}

User.unserialize = function(json) {
  return new User(json.account, json.id, json.name);
};

module.exports = User;
