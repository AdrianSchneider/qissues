'use strict';

var Expectations = require('../../../model/expectations');

module.exports = {
  initialize: function() {
    return new Expectations({
      domain:   { type: 'string', required: true },
      username: { type: 'string', required: true },
      password: { type: 'string', required: true }
    });
  }
};
