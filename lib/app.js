var util          = require('util');
var path          = require('path');
var EventEmitter  = require('events').EventEmitter;
var backend       = require('./backend');
var views         = require('./views');
var blessed       = require('blessed');
var ReportManager = require('./model/reportManager');
var FilterSet     = require('./model/filterSet');
var Storage       = require('./storage');
var message       = require('./widgets/message');

module.exports = Application;

function Application(screen, options) {
  var app = this;

  /**
   * Starts up the application
   * @param initial view
   */
  this.start = function(call) {
    app.storage = new Storage(path.resolve(options.cwd, './.qi.json'));
    app.reports = new ReportManager(app.storage);
    app.filters = app.reports.getDefault().getFilters();

    setupKeyboard();
    screen.render();
    app.listIssues();
  };

  /**
   * Sets up the global keyboard handlers
   */
  var setupKeyboard = function() {
    screen.key(['q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });

    screen.key('m', function() {
      backend.metadata(options, function(err, data) {
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

    var list = views.list(screen, app.filters, app.reports, app.storage, function(done) {
      return backend.query(options, app.filters, done);
    });

    list.on('open', app.viewIssue);
  };

  /**
   * View a single issue
   * @param number num issue number
   */
  this.viewIssue = function(num) {
    app.loading();

    backend.lookup(num, options, function(err, issue) {
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
      backend.createTemplate(options, function(err, template) {
        app.empty();

        screen.readEditor({ value: template }, function(err, data) {

          backend.create(data, options, function(err, num) {
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
