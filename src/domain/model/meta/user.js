'use strict';

module.exports = function User(account, id, name) {

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

};
