'use strict';

var ValidationError = require('../../errors/validation');

module.exports = function NewComment(message, issueNumber) {
  if(!message) throw new ValidationError('Comment must not be empty');
  if(!issueNumber) throw new TypeError('NewComment requires an issue number');

  this.getMessage = function() {
    return message;
  };

  this.getIssue = function() {
    return issueNumber;
  };

};
