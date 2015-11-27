'use strict';

var Type    = require('../../model/meta/type');
var User    = require('../../model/meta/user');
var Project = require('../../model/meta/project');

module.exports = function Metadata() {

  var types = [];
  var users = [];
  var sprints = [];
  var projects = [];
  var statuses = [];

  this.setTypes = function(newTypes) {
    types = newTypes;
  };

  this.getTypes = function() {
    return types.map(function(type) {
      return new Type(type);
    });

  };

  this.setUsers = function(newUsers) {
    users = newUsers;
  };

  this.getUsers = function(user) {
    return users.map(function(user) {
      return new User(user);
    });
  };

  this.setProjects = function(newProjects) {
    projects = newProjects;
  };

  this.getProjects = function() {
    return projects.map(function(project) {
      return new Project(project);
    });
  };

  this.getSprints = function() {

  };

  this.getStatuses = function() {

  };

};
