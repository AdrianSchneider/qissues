var util          = require('util');
var path          = require('path');
var EventEmitter  = require('events').EventEmitter;
var backend       = require('./backend');
var views         = require('./views');
var blessed       = require('blessed');
var ReportManager = require('./model/reportManager');

module.exports = Application;

function Application(screen, options) {
  var app = this;

  /**
   * Starts up the application
   * @param initial view
   */
  this.start = function(call) {
    screen.key(['q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });
    screen.key(['escape', 'h'], function(ch, key) {
      app.listIssues();
    });

    screen.render();
    app[call]();
  };

  /**
   * Lists all of the issues
   */
  this.listIssues = function() {
    app.loading();

    var reports = new ReportManager(path.resolve(options.cwd, './.qi.json'));

    var list = views.list(screen, reports, function(done) {
      return backend.query(options, done);
    });

    list.on('open', app.viewIssue);
    list.key('r', app.listIssues);
    list.key('c', app.createIssue);
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

      single.key('e', function() {
        app.editIssue(num);
      });

      single.key('c', function() {
        console.log('leave a comment');
      });

      single.key('r', function() { app.viewIssue(num); });

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

    var box = new blessed.box();
    box.setContent('Loading...');

    screen.append(box);
    screen.render();
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
