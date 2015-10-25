'use strict';

var winston = require('winston');

module.exports = function(level) {
  if(!level) level = 0;
  var levels = { error: 0, warn: 1, info: 2, debug: 3 };
  if(level > 3) level = 3;

  var consoleTransport = new winston.transports.Console({ level: levels[level] });
  consoleTransport.stderrLevels = levels;
  var logger = new winston.Logger({ transports: [consoleTransport] });
  logger.setLevels(levels);

  return logger;
};
