'use strict';

var User = require('./meta/user');

module.exports = function Comment(message, author, date) {
  if(!(author instanceof User)) throw new TypeError('Comment.author expects a User');

  this.getMessage = function() {
    return message;
  };

  this.getAuthor = function() {
    return author;
  };

  this.getDate = function() {
    return date;
  };

};
