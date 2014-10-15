var Client = require('./client');

module.exports = Lookup;

function Lookup(num, options, done) {
  var client = new Client(options.hostname, options.username, options.password);
  var opts = { json: true };
  client.get('/rest/api/2/issue/' + num, opts, done);
}
