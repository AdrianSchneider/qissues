'use strict';

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
}

util.inherits(IssuesCollection, Array);

module.exports = IssuesCollection;
