var _       = require('underscore');
var request = require('request');

module.exports = function(domain, username, password) {

  this.get = function(path, options, done) {
    request.get(buildUrl(path), attachOptions(options), function(err, res, body) {
      if(err) return done(err);
      return done(null, body);
    });
  };

  this.post = function(path, data, done) {
    var opts = attachOptions();
    opts.json = data;
    request.post(buildUrl(path), opts, done);
  };

  var buildUrl = function(path) {
    return "https://" + domain + path;
  };

  var attachOptions = function(options) {
    var opts = _.clone(options || {});
    opts.json = true;
    opts.auth = { username: username, password: password };

    return opts;
  };

};
