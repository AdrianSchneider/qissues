'use strict';

var pty = require('pty.js');
var Promise = require('bluebird');
var spawn   = require('child_process').spawn;

function Tui() {
  this.spawnInteractive = function(program, args, callback) {
    if(!args) args = [];
    if(this.program) this.program.destroy();
    this.program = pty.spawn('bash', [], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      env: process.env
    });

    this.program.write(program + ' ' + args.map(function(a) { return '"' + a + '"'; }) + '\n');

    this.program.output = '';
    this.program.on('data', function(data) {
      this.program.output += data.replace('\\r', '');
    }.bind(this));

    this.program.on('exit', function() {
      callback();
    });
  };
}

module.exports = function() {
  //this.World = Tui;
};
