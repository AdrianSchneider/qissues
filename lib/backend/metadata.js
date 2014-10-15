var _      = require('underscore');
var async  = require('async');
var spawn  = require('child_process').spawn;
var Client = require('./client');

module.exports = function(options, done) {
  var client = new Client(options.hostname, options.username, options.password);

  var main = function(callback) {
    return async.parallel({
      projects: function(next) {
        var opts = { json: true };
        client.get('/rest/api/2/issue/createmeta', opts, function(err, body) {
          return next(null, body.projects);
        });
      },
    }, function(err, results) {
      if(err) return callback(err);

      var statuses = [];
      async.each(results.projects, getStatuses, function(err) {
        results.projects.forEach(function(project) {
          project.statuses.forEach(function(status) {
            statuses.push(status.name);
          });
        });

        results.statuses = _.uniq(statuses);
        return callback(err, results);
      });
    });
  };

  var getStatuses = function getStatuses(project, callback) {
    var opts = { json: true };
    client.get('/rest/api/2/project/' + project.key + '/statuses', opts, function(err, body) {
      var out = [];
      body.forEach(function(type) {
        type.statuses.forEach(function(status) {
          out.push(status);
        });
      });

      if(err) return callback(err);
      project.statuses = out;
      return callback();
    });
  };

  return main(done);
};

