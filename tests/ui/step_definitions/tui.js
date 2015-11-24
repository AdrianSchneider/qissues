'use strict';

var expect = require('chai').expect;

module.exports = function() {

  this.Given(/^I launch "([^"]*)"$/, function(program, callback) {
    this.spawn(program, [], callback);
  });

  this.Given(/^I launch "([^"]*)" with "([^"]*)"$/, function(program, args, callback) {
    this.spawn(program, args.split(' '), callback);
  });

  this.Then(/^the output should equal:$/, function(desiredOutput) {
    expect(this.program.output.replace(/\r/g, '')).to.equal(desiredOutput.replace(/\r/g, ''));
  });

  this.Given(/^I resize the window to (\d+) by (\d+)$/, function(width, height) {
    this.term.resize(width, height);
  });

};
