var moment = require('moment');
var Client = require('./client');

module.exports = function(config, storage, report, done) {
  var client = new Client(config.hostname, config.username, config.password);
  var ttl = config.ttl || [60, 'minutes'];

  var options = {
    qs: {
      jql: buildJql(report.getFilters()).join(' AND '),
      maxResults: 1000
    }
  };

  var cacheKey = 'issues:' + md5(options.qs.jql);
  var cache = storage.get(cacheKey);
  if(cache && new Date(cache.expires) > new Date()) {
    return done(null, cache.data);
  }

  client.get('/rest/api/2/search', options, function(err, issues) {
    if(err) console.error(arguments);
    if(err) return done(err);
    storage.set(cacheKey, {
      data: issues.issues,
      expires: moment().add(ttl[0], ttl[1])
    });

    done(null, issues.issues);
  });
};

function buildJql(filters) {
  return filters.flatten().map(function(filter) {
    return filter[0]  +' in (' +
      filter[1].map(function(item) {
        return "'" + item.replace(/'/g, "\\'") + "'";
      }).join(',') +
    ')';
  });
}

function md5(str) {
  return require('crypto').createHash('md5').update(str).digest("hex");
}
