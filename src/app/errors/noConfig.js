var util = require("util");

function NoConfigError(message) {
  Error.call(this);
  Error.captureStackTrace(this, this.constructor);

  this.name = 'NoConfigError';
  this.message = message;
}

util.inherits(NoConfigError, Error);
module.exports = NoConfigError;
