var moment = require('moment');
var Client = require('./client');

module.exports = function(options, storage, filters, done) {
  var client = new Client(options.hostname, options.username, options.password);

  var opts = {
    qs: {
      jql: buildJql(filters).join(' AND '),
      maxResults: 1000
    }
  };

  var cacheKey = 'issues:' + md5(opts.qs.jql);
  var cache = storage.get(cacheKey);
  if(cache && new Date(cache.expires) > new Date()) {
    return done(null, cache.data);
  }

  client.get('/rest/api/2/search', opts, function(err, issues) {
    storage.set(cacheKey, {
      data: issues.issues,
      expires: moment().add(5, 'minutes')
    });

    done(err, issues.issues);
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
