var Client = require('./client');

module.exports = function Comment(num, text, config, done) {
  var client = new Client(config.hostname, config.username, config.password);
  var data = { body: text };

  client.post('/rest/api/2/issue/' + num + '/comment', data, function(err, body) {
    done(err, body);
  });
};
