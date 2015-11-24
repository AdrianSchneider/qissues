'use strict';

var pty = require('pty.js');

function Tui() {
  this.spawn = function(program, args, callback) {
    if(this.program) this.program.destroy();
    this.program = pty.spawn(program, args || [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      env: process.env
    });

    this.program.output = '';
    this.program.stdout.on('data', function(data) {
      this.program.output += data.toString('utf-8').replace('\\r', '');
    }.bind(this));

    this.program.on('exit', function() {
      callback();
    });
  };
}

module.exports = function() {
  this.World = Tui;
};
