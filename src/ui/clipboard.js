'use strict';

var Promise = require('bluebird');
var copyPaste = Promise.promisifyAll(require('copy-paste'));

module.exports = {
  copy: function(text) {
    return copyPaste.copyAsync(text);
  },
  paste: function() {
    return copyPaste.pasteAsync();
  }
};
