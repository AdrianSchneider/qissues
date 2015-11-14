'use strict';

var _ = require('underscore');
var winston = require('winston');

module.exports = function(level) {
  level = 5 - level;
  var levels = {
    trace: 0, 
    "debug": 1, 
    "info": 2, 
    "warn": 3,
    "error": 4, 
    "silent": 5
  };

  if(level > 5) level = 5;
  if(level < 1) level = 0;

  var lookup = _.invert(levels);
  var consoleTransport = new winston.transports.Console({ level: lookup[level] });
  consoleTransport.stderrLevels = levels;
  var logger = new winston.Logger({ 
    transports: [consoleTransport],
    level: lookup[level],
    levels: levels
  });

  return logger;
};
