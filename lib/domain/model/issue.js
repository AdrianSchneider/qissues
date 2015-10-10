'use strict';

module.exports = function Issue(data) {

  // XXX quick proxy
  var self = this;
  Object.keys(data).forEach(function(key) {
    self[key] = data[key];
  });

};
