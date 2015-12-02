'use strict';

var expect = require('chai').expect;
var f = require('../../../src/util/f');

module.exports = function() {

  this.Given(/^I launch "([^"]*)"$/, function(program) {
    return this.spawn(program, [])
      .then(f.tee(this, 'lastProgram'));
  });

  this.Given(/^I launch "([^"]*)" with "([^"]*)"$/, function(program, args) {
    return this.spawn(program, args.split(' '))
      .then(f.tee(this, 'lastProgram'));
  });

  this.Then(/^the output should equal:$/, function(desiredOutput) {
    expect(this.lastProgram.stdout.replace(/\r/g, '')).to.equal(desiredOutput.replace(/\r/g, ''));
  });

  this.Given(/^I resize the window to (\d+) by (\d+)$/, function(width, height) {
    this.term.resize(width, height);
  });

};
