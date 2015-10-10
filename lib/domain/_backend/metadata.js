var _      = require('underscore');
var async  = require('async');
var spawn  = require('child_process').spawn;
var Client = require('./client');

module.exports = function(options, done) {
  var client = new Client(options.hostname, options.username, options.password);

  /**
   * Main function body
   */
  var main = function(callback) {
    var results = {};

    async.series({
      labels: function(next) {
        client.get('/rest/api/1.0/labels/suggest', { qs: { query: "" } }, function(err, body) {
          if(err) return next(err);
          results.labels = _.pluck(body.suggestions, 'label');
          return next();
        });
      },
      views: function(next) {
        client.get('/rest/greenhopper/1.0/rapidview', {}, function(err, body) {
          if(err) return next(err);
          results.views = body.views;
          return next();
        });
      },
      projects: function(next) {
        return getProjects(function(err, projects) {
          results.projects = projects;

          async.each(projects, _.bind(getProjectMetadata, results), function(err) {
            if(err) return next(err);

            var statuses = [];
            var types = [];

            results.projects.forEach(function(project) {
              project.statuses.forEach(function(status) {
                statuses.push(status.name);
              });
              project.issuetypes.forEach(function(type) {
                types.push(type);
              });
            });

            results.types = _.uniq(types, function(type) { return type.name; });
            results.statuses = _.uniq(statuses);

            return next(null, results);
          });
        });
      },
      sprints: function(next) {
        results.sprints = [];

        async.each(results.views, function(view, nextView) {
          var opts = {
            qs: { rapidViewId: view.id }
          };

          client.get('/rest/greenhopper/1.0/xboard/plan/backlog/data.json', opts, function(err, sprints) {
            if(err) return nextView(err);

            if(sprints.sprints.length) {

              sprints.projects.map(function(project) {
                return _.findWhere(results.projects, { name: project.name });
              }).forEach(function(project) {
                sprints.sprints.forEach(function(sprint) {
                  delete sprint.issueIds;
                  project.sprints.push(sprint);
                  results.sprints.push(sprint);
                });
              });
            }

            return nextView();
          });

        }, function(err) {
          if(err) return next(err);
          results.sprints = _.uniq(results.sprints, function(sprint) {
            return sprint.id;
          });
          return next();
        });
      },
    }, function(err) {
      if(err) return callback(err);
      return callback(null, results);
    });
  };

  var getProjectMetadata = function(project, done) {
    var results = this;

    project.sprints = [];

    async.series({
      getStatuses: function(next) {
        getStatuses(project, next);
      },
      getAssignees: function(next) {
        var opts = { qs: { project: project.key } };
        client.get('/rest/api/2/user/assignable/search', opts, function(err, users) {
          if(err) return next(err);
          results.users = users;
          return next();
        });
      }
    }, done);
  };

  /**
   * Gets all projects
   * @param function done
   */
  var getProjects = function(done) {
    var opts = { json: true };
    client.get('/rest/api/2/issue/createmeta', opts, function(err, body) {
      return done(null, body.projects);
    });
  };

  /**
   * Gets a list of statuses
   * @param object project
   * @param function callback
   */
  var getStatuses = function getStatuses(project, callback) {
    var opts = { json: true };
    client.get('/rest/api/2/project/' + project.key + '/statuses', opts, function(err, body) {
      var out = [];
      body.forEach(function(type) {
        type.statuses.forEach(function(status) {
          out.push(status);
        });
      });

      project.statuses = [];
      if(err) return callback(err);
      project.statuses = _.uniq(out, function(status) { 
        return status.name;
      });
      return callback();
    });
  };

  return main(done);
};

