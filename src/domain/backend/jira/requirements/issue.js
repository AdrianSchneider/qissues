'use strict';

var Expectations = require('../../../model/expectations');
var User         = require('../../../model/meta/user');
var Type         = require('../../../model/meta/type');
var Sprint       = require('../../../model/meta/sprint');

module.exports = {
  create: function(metadata) {
    return new Expectations({
      title       : { type: String, required: true,  default: '' },
      description : { type: String, required: false, default: "" },
      type        : { type: String, required: true,  default: '', choices: metadata.getTypes() },
      assignee    : { type: String, required: false, default: '', choices: metadata.getUsers() },
      sprint      : { type: String, required: false, default: '', choices: metadata.getSprints() }
    });
  },
  update: function(metadata) {
    return new Expectations({
      title       : { type: String, required: true,  default: '' },
      description : { type: String, required: false, default: "" },
      type        : { type: String, required: true,  default: '', choices: metadata.getTypes() },
      assignee    : { type: String, required: false, default: '', choices: metadata.getUsers() },
      sprint      : { type: String, required: false, default: '', choices: metadata.getSprints() }
    });
  }
};
