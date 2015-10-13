'use strict';

var Expectations = require('../../../model/expectations');

module.exports = {
  create: new Expectations({
    title       : { type: String, required: true, default: '' },
    description : { type: String, required: false, default: "" },
    type        : { type: String, required: true, default: '' }
  }),
  update: new Expectations({
    title       : { type: String, required: true , default: ''},
    description : { type: String, required: false, default: "" },
    type        : { type: String, required: true, default: '' }
  })
};
