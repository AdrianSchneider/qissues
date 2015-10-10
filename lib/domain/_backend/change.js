var async  = require('async');
var Client = require('./client');

module.exports = function(num, changes, config, cache, done) {
  var client = new Client(config.hostname, config.username, config.password);

  console.error('changing ' + num + ' to ', changes);

  /**
   * Main body
   */
  var run = function() {
    var workload = [];
    if(typeof changes.assignee !== 'undefined') {
      workload.push(function(next) {
        changeAssignee(changes.assignee, next);
      });
    }

    if(typeof changes.title !== 'undefined') {
      workload.push(function(next) {
        changeTitle(changes.title, next);
      });
    }

    return async.parallel(workload, function(err) {
      if(err) console.error(err);
      cache.invalidate('lookup:' + num);
      return done(err);
    });
  };

  /**
   * Updates assignee
   * @param string value
   * @param function next
   */
  var changeAssignee = function(assignee, next) {
    var data = { name: assignee ? assignee : null };
    return client.put('/rest/api/2/issue/' + num + '/assignee', data, next);
  };

  /**
   * Change the title of the issue
   * @param string value
   * @param function next
   */
  var changeTitle = function(value, next) {
    var data = { fields: { summary: value } };
    return client.put('/rest/api/2/issue/' + num, data, next);
  };

  var changeSprint = function(value, next) {
    return next();
  };

  run();
};
