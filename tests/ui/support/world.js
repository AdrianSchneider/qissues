'use strict';

var pty     = require('pty.js');
var Promise = require('bluebird');
var spawn   = require('child_process').spawn;

function World() {
  this.spawn = function(program, args) {
    return new Promise(function(resolve, reject) {
      var result = { 
        code: null,
        stdout: '',
        stderr: ''
      };

      var ps = spawn(program, args || []);

      ps.stdout.on('data', function(data) {
        result.stdout += data.toString('utf-8');
      });
      ps.stderr.on('data', function(data) {
        result.stderr += data.toString('utf-8');
      });
      ps.on('exit', function(code) {
        result.code = code;
        resolve(result);
      });
    });
  };

  this.spawnInteractive = function(program, args, callback) {
    throw new Error('wip');

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
  this.World = World;
};
