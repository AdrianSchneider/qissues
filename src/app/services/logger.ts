import * as _ from 'underscore';
import * as winston from 'winston';

interface Logger {
  debug: (string) => void;
  info:  (string) => void;
  warn:  (string) => void;
  error: (string) => void;
  trace?: (string) => void;
  silent?: (string) => void;
}

export function getLogger(level: number): Logger {
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

  const lookup = _.invert(levels);
  const logger = new winston.Logger({
    transports: [
      new winston.transports.Console({
        level: lookup[level],
        stderrLevels: Object.keys(levels)
      })
    ],
    level: lookup[level],
    levels: levels
  });

  return logger;
}

export default Logger;
