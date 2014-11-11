var moment = require('moment');
var Client = require('./client');

module.exports = function(config, cache, report, force, done) {
  var query = this;
  var client = new Client(config.hostname, config.username, config.password);
  var ttl = config.ttl || [60, 'minutes'];

  var options = {
    qs: {
      jql: report.getFilters().toJql(),
      maxResults: 1000
    }
  };

  var cacheId = 'issues:' + options.qs.jql;
  if(!force) {
    var cached = cache.get(cacheId);
    if(cached) return done(null, cached);
  }

  client.get('/rest/api/2/search', options, function(err, issues) {
    if(err) {
      console.error(arguments);
      return done(err);
    }

    cache.set(cacheId, issues.issues);
    done(null, issues.issues);
  });
};

function md5(str) {
  return require('crypto').createHash('md5').update(str).digest("hex");
}
