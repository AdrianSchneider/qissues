'use strict';

var expect = require('chai').expect;

module.exports = function() {

  this.Given(/^I resize the window to (\d+) by (\d+)$/, function(width, height) {
    this.term.resize(width, height);
  });

};
