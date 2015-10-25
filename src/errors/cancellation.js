var util = require("util");

function CancellationError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);

  this.name = 'CancellationError';
  this.message = message;
}

util.inherits(CancellationError, Error);
module.exports = CancellationError;
