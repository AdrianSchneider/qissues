'use strict';

var _         = require('underscore');
var util      = require('util');
var Issue     = require('./issue');
var allTypeOf = require('../../util/types').allTypeOf;

var methods = ['forEach', 'map', 'filter'];

function IssuesCollection(issues) {
  if(!allTypeOf(issues, Issue)) {
    throw new TypeError('IssuesCollection expects an array of Issue models');
  }

  var collection = this;
  collection.length = issues.length;

  methods.forEach(function(method) {
    collection[method] = [][method].bind(issues);
  });

  this.get = function(i) {
    return issues[i];
  };

  this.getIds = function() {
    return issues.map(function(issue) {
      return issue.getId();
    });
  };

  this.find = function(id) {
    return _.find(issues, function(issue) {
      return issue.getId() === id;
    });
  };

  this.findByIds = function(ids) {
    return new IssuesCollection(
        ids
        .map(this.find)
        .filter(function(i) { return i; })
    );
  };

  this.getField = function(field) {
    return issues.map(function(issue) {
      return issue.get(field);
    });
  };
}

util.inherits(IssuesCollection, Array);

module.exports = IssuesCollection;
