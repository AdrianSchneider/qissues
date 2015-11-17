'use strict';

var blessed     = require('blessed');
var BlessedApplication = require('./app');

module.exports = function UserInterface(input, output) {
  if (!input) input = process.stdin;
  if (!output) output = process.stdout;

  this.start = function(app, action, id, logger) {
    var blessedApp = new BlessedApplication(
      blessed.screen({ input: input, output: output }),
      app,
      logger
    );

    blessedApp.start(action, id);
  };

};
