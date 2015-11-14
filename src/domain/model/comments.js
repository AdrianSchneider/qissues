'use strict';

var util      = require('util');
var Comment   = require('./comment');
var allTypeOf = require('../../util/types').allTypeOf;

var methods = ['forEach', 'map', 'filter'];

function CommentsCollection(comments) {
  if(!allTypeOf(comments, Comment)) {
    throw new TypeError('CommentsCollection expects an array of Comment models');
  }

  var collection = this;
  collection.length = comments.length;

  methods.forEach(function(method) {
    collection[method] = [][method].bind(comments);
  });

  this.get = function(i) {
    return comments[i];
  };
}

util.inherits(CommentsCollection, Array);

module.exports = CommentsCollection;
