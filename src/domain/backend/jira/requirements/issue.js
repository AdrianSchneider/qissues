'use strict';

var Expectations = require('../../../model/expectations');
var User         = require('../../../model/meta/user');
var Type         = require('../../../model/meta/type');
var Sprint       = require('../../../model/meta/sprint');

module.exports = {
  create: function(metadata) {
    return new Expectations({
      title       : { type: 'string', required: true,  default: '' },
      description : { type: 'string', required: false, default: "" },
      type        : { type: 'string', required: true,  default: '', choices: metadata.getTypes() },
      assignee    : { type: 'string', required: false, default: '', choices: metadata.getUsers() },
      sprint      : { type: 'string', required: false, default: '', choices: metadata.getSprints() }
    });
  },
  update: function(metadata) {
    return new Expectations({
      title       : { type: 'string', required: true,  default: '' },
      description : { type: 'string', required: false, default: "" },
      type        : { type: 'string', required: true,  default: '', choices: metadata.getTypes() },
      assignee    : { type: 'string', required: false, default: '', choices: metadata.getUsers() },
      sprint      : { type: 'string', required: false, default: '', choices: metadata.getSprints() }
    });
  }
};
