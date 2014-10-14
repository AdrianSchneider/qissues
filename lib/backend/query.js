var spawn  = require('child_process').spawn;
var Client = require('./client');

module.exports = function(options, done) {
  return done(null, [
    { key: "DEV-1", fields: { summary: "This is the issue title " } },
    { key: "DEV-2", fields: { summary: "This is the issue title " } },
    { key: "DEV-3", fields: { summary: "This is the issue title " } },
    { key: "DEV-4", fields: { summary: "This is the issue title " } },
    { key: "DEV-5", fields: { summary: "This is the issue title " } }
  ]);

  var client = new Client(options.hostname, options.username, options.password);

  var opts = {};
  client.get('/rest/api/2/search', opts, function(err, issues) {
    done(err, issues.issues);
  });
};
