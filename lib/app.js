var async           = require('async');
var util            = require('util');
var path            = require('path');
var EventEmitter    = require('events').EventEmitter;
var backend         = require('./backend');
var views           = require('./views');
var ReportManager   = require('./model/reportManager');
var Storage         = require('./storage');
var Cache           = require('./cache');
var message         = require('./widgets/message');
var prompt          = require('./widgets/prompt');
var ValidationError = require('./errors/validation');
var spawn           = require('child_process').spawn;

/**
 * Main Qissues application
 *
 * @param blessed.screen screen
 * @param object         options on invokation
 */
function Application(screen, options) {
  var app = this;
  var config;

  /**
   * Starts up the application
   * @param initial view
   */
  this.start = function(action, id) {
    setupKeyboard();
    screen.render();

    loadConfig(function(err, configStore) {
      config = configStore.serialize();

      app.storage  = new Storage(path.resolve(options.cwd, './.qi.json'));
      app.cache    = new Cache(app.storage);
      app.reports  = new ReportManager(app.storage);
      app.report   = app.reports.getDefault();
      app.filters  = app.reports.getDefault().getFilters();
      app.metadata = app.storage.get('metadata');

      if(action) {
        app[action](id);
      } else {
        app.listIssues();
      }
    });
  };

  /**
   * Loads the config into the app
   * @param function done
   */
  var loadConfig = function(done) {
    var fields = ['hostname', 'username', 'password'];
    var configStore = new Storage(options.userConfig);

    async.eachSeries(fields, function(field, next) {
      if(configStore.get(field)) return next();

      prompt('Configuration: ' + field, screen, function(err, text) {
        if(err) return next(err);
        configStore.set(field, text);
        return next(null, text);
      });

    }, function(err) {
      if(err) return done(err);
      return done(null, configStore);
    });
  };

  /**
   * Sets up the global keyboard handlers
   */
  var setupKeyboard = function() {
    screen.key('C-c', function(ch, key) {
      return process.exit(0);
    });

    screen.key('?', function() {
      var opt = {
        stdio: 'inherit',
        env: process.env,
      };
      screen.exec('less', ['-c', 'docs/help.txt'], opt, function() {});
      screen.render();
    });

    screen.key('m', app.reloadMetadata);
  };

  /**
   * Lists all of the issues
   *
   * @param boolean invalidate
   */
  this.listIssues = function(invalidate, focus) {
    app.loading(invalidate ? 'Refreshing...' : null);

    var list = views.list(screen, app, !!invalidate, focus, function(done) {
      return backend.query(config, app.cache, app.report, !!invalidate, done);
    });

    list.on('open', function(num) {
      app.viewIssue(num);
    });

    list.key('S-i', function() {
      prompt('Open Issue', screen, function(err, text) {
        app.viewIssue(text);
      });
    });

    list.key('c', function() {
      app.createIssue(app.report.getFilters());
    });
    list.key('S-c', function() {
      app.createIssue();
    });

    list.key('C-r', function() {
      app.listIssues(true);
    });

    list.key('w', function() {
      var browser = config.browser || 'open';
      spawn(browser, [
        'https://' + config.hostname + '/issues/?jql=' + encodeURIComponent(app.filters.toJql())
      ]);
    });
  };

  /**
   * Reloads the metadata and dumps it to stderr
   */
  this.reloadMetadata = function() {
    app.loading('Downloading metadata...');
    backend.metadata(config, function(err, data) {
      app.storage.set('metadata', data);
      message(screen, 'Done!');
    });
  };

  /**
   * View a single issue
   *
   * @param number num issue number
   * @param boolean invalidate
   */
  this.viewIssue = function(num, invalidate) {
    app.loading(invalidate ? 'Refreshing...' : '');

    backend.lookup(num, config, app.cache, invalidate, function(err, issue) {
      if(err) return app.emit('error', err);

      app.empty();
      var single = views.single(screen, issue);

      single.key(['escape', 'h'], function() {
        app.listIssues(null, num);
      });

      single.key('C-r', function() {
        app.viewIssue(num, true);
      });

      single.key('w', function() {
        var browser = config.browser || 'open';
        spawn(browser, [
          'https://' + config.hostname + '/browse/' + num + '?jql=' + encodeURIComponent(app.filters.toJql())
        ]);
      });

      single.key('c', function() {
        prompt('Comment', screen, function(err, comment) {
          if(comment && comment.length) {
            backend.comment(num, comment, config, function(err) {
              if(err) console.error(err);
              app.viewIssue(num, true);
            });
          }
        });
      });

      single.key('S-c', function() {
        screen.readEditor({ value: '' }, function(err, comment) {
          if(err) console.error(err);
          if(comment && comment.length) {
            backend.comment(num, comment, config, function(err) {
              if(err) console.error(err);
              app.viewIssue(num, true);
            });
          }
        });
      });

    });
  };

  /**
   * Creates a new issue interactively
   */
  this.createIssue = function(filters) {
    app.loading();

    backend.createTemplate(config, filters, app.storage.get('metadata'), function(err, template) {
      app.empty();

      var isValid = false;
      var contents = template;
      var number;

      async.doUntil(
        function(next) {
          screen.readEditor({ value: contents }, function(err, data) {
            if(err) return next(err);

            if(data.trim() === template.trim() || !data.length) {
              message(screen, 'Cancelled');
              return setTimeout(app.listIssues, 500);
            }

            app.loading('Creating issue...');
            backend.create(data, config, app.metadata, filters, function(err, num) {
              if(err instanceof ValidationError) {
                contents = '# Errors: ' + err.message + '\n' + data;
                return next();
              } else if(err) {
                return next(err);
              }

              isValid = true;
              number = num;
              return next();
            });
          });
        },
        function() { return isValid; },
        function(err) {
          if(err) return console.error(err.stack);
          app.viewIssue(number);
        }
      );
    });
  };

  /**
   * Edit an issue
   * @param number num issue number
   */
  this.editIssue = function(num) {
    screen.readEditor({ value: num }, function(err, data) {
      app.viewIssue(num);
    });
  };

  /***
   * Clears the screen and draws a loading indicator
   */
  this.loading = function(msg) {
    app.empty();
    message(screen, msg || 'Loading...', Infinity);
  };

  /**
   * Clears the screen
   */
  this.empty = function() {
    screen.children.forEach(function(child) {
      screen.remove(child);
    });
    screen.render();
  };
}

util.inherits(Application, EventEmitter);
module.exports = Application;
