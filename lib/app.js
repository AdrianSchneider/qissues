var async         = require('async');
var util          = require('util');
var path          = require('path');
var EventEmitter  = require('events').EventEmitter;
var backend       = require('./backend');
var views         = require('./views');
var ReportManager = require('./model/reportManager');
var Storage       = require('./storage');
var message       = require('./widgets/message');
var prompt        = require('./widgets/prompt');

module.exports = Application;

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

      app.storage = new Storage(path.resolve(options.cwd, './.qi.json'));
      app.reports = new ReportManager(app.storage);
      app.report  = app.reports.getDefault();
      app.filters = app.reports.getDefault().getFilters();

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
    screen.key(['q', 'C-c'], function(ch, key) {
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

    screen.key('S-i', function(key, ch) {
      prompt('Open Issue', screen, function(err, text) {
        app.viewIssue(text);
      });
    });

    screen.key('m', function() {
      backend.metadata(config, function(err, data) {
        app.storage.set('metadata', data);
        console.error(data);
      });
    });
  };

  /**
   * Lists all of the issues
   */
  this.listIssues = function() {
    app.loading();

    var list = views.list(screen, app, function(done) {
      return backend.query(config, app.storage, app.report, done);
    });

    list.on('open', app.viewIssue);
  };

  /**
   * View a single issue
   * @param number num issue number
   */
  this.viewIssue = function(num) {
    app.loading();

    backend.lookup(num, config, function(err, issue) {
      if(err) return app.emit('error', err);

      app.empty();
      var single = views.single(screen, issue);

      single.key(['escape', 'h'], function() {
        app.listIssues();
      });

      single.key('r', function() {
        app.viewIssue(num);
      });
    });
  };

  /**
   * Creates a new issue interactively
   */
  this.createIssue = function() {
      app.loading();
      backend.createTemplate(config, function(err, template) {
        app.empty();

        screen.readEditor({ value: template }, function(err, data) {

          backend.create(data, config, function(err, num) {
            console.log(arguments);
            return;
            if(err) console.log(err);
            app.viewIssue(num);
          });
        });
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
  this.loading = function() {
    app.empty();
    message(screen, 'Loading...', Infinity);
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
