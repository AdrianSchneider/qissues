'use strict';

var Expectations = require('../../../model/expectations');

module.exports = new Expectations({
  domain:   { type: 'string', required: true, default: '' },
  username: { type: 'string', required: true, default: '' },
  password: { type: 'string', required: true, default: '' }
});
