'use strict';

var Container   = require('./services/container');
var Cache       = require('./services/cache');
var Storage     = require('./services/storage');
var JiraBackend = require('./domain/backend/jira');
var Browser     = require('./ui/browser');

module.exports = function(configFile) {
  var container = new Container();
  var config = require(configFile);

  container.set('storage', new Storage(configFile));
  container.set('cache', new Cache(container.get('storage')));
  container.set('config', config);
  container.set('backend', new JiraBackend(container));
  container.set('browser', new Browser(container));

  return container;
};
