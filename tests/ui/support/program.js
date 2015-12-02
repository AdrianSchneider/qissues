'use strict';

var Promise = require('bluebird');
var spawn   = require('child_process').spawn;

function Program() {
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
}

module.exports = function() {
  this.World = Program;
};
