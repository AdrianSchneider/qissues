'use strict';

var util = require('util');
var Expectations = require('../model/expectations');

/**
 * Signifies that additional, probably unexpected
 * user input is required
 */
function MoreInfoRequiredError(message, expectations) {
  if (!(expectations instanceof Expectations)) {
    throw new TypeError('MoreInfo requires valid Expectations');
  }

  Error.call(this);
  Error.captureStackTrace(this, this.constructor);

  this.name = 'CancellationError';
  this.message = message;
  this.expectations = expectations;
}

util.inherits(MoreInfoRequiredError, Error);
module.exports = MoreInfoRequiredError;
