var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var backend      = require('./backend');
var views        = require('./views');
var blessed      = require('blessed');

module.exports = Qissues;

function Qissues(screen, options) {
  var q = this;

  /**
   * Starts up the application
   * @param initial view
   */
  this.start = function(call) {
    screen.key(['q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });
    screen.key(['escape', 'h'], function(ch, key) {
      q.listIssues();
    });

    screen.render();
    q[call]();
  };

  /**
   * Lists all of the issues
   */
  this.listIssues = function() {
    q.loading();

    backend.query(options, function(err, issues) {
      if(err) return q.emit('error', err);

      q.empty();
      var list = views.list(screen, issues);

      list.on('open', q.viewIssue);
      list.key('r', q.listIssues);
      list.key('c', q.createIssue);
    });
  };

  /**
   * View a single issue
   * @param number num issue number
   */
  this.viewIssue = function(num) {
    q.loading();

    backend.lookup(num, options, function(err, issue) {
      if(err) return q.emit('error', err);

      q.empty();
      var single = views.single(screen, issue);

      single.key('e', function() {
        q.editIssue(num);
      });

      single.key('c', function() {
        console.log('leave a comment');
      });

      single.key('r', function() { q.viewIssue(num); });

    });
  };

  /**
   * Creates a new issue interactively
   */
  this.createIssue = function() {
      q.loading();
      backend.createTemplate(options, function(err, template) {
        q.empty();

        screen.readEditor({ value: template }, function(err, data) {

          backend.create(data, options, function(err, num) {
            console.log(arguments);
            return;
            if(err) console.log(err);
            q.viewIssue(num);
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
      q.viewIssue(num);
    });
  };

  /***
   * Clears the screen and draws a loading indicator
   */
  this.loading = function() {
    q.empty();

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

util.inherits(Qissues, EventEmitter);
