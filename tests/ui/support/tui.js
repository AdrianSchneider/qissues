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

    console.log('program', this.program);

    this.program.output = '';
    this.program.on('data', function(data) {
      console.log('received data', data);
      this.program.output += data.replace('\\r', '');
    }.bind(this));

    this.program.socket.on('data', function(data) {
      console.log('s.d', data);
      console.log('s.d.s', data.toString('utf-8'));
    });

    this.program.on('exit', function() {
      console.log('received exit');
      callback();
    });
  };
}

module.exports = function() {
  this.World = Tui;
};
