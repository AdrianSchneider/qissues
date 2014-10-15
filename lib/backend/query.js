var spawn  = require('child_process').spawn;
var Client = require('./client');

module.exports = function(options, filters, done) {
  var client = new Client(options.hostname, options.username, options.password);

  var opts = {
    qs: {
      jql: buildJql(filters).join(' AND '),
      maxResults: 100
    }
  };

  client.get('/rest/api/2/search', opts, function(err, issues) {
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
