var Client = require('./client');

module.exports = Lookup;

function Lookup(num, options, cache, invalidate, done) {
  var client = new Client(options.hostname, options.username, options.password);
  var opts = { json: true };

  var cacheId = 'lookup:' + num;
  var cached = cache.get(cacheId, invalidate);
  if(cached) return done(null, cached);

  client.get('/rest/api/2/issue/' + num, opts, function(err, body) {
    if(err) return done(err);

    cache.set(cacheId, body);
    return done(null, body);
  });
}
