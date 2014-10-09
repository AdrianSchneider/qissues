var util         = require('util');
var EventEmitter = require('events').EventEmitter;
var backend      = require('./backend');
var views        = require('./views');
var blessed      = require('blessed');

module.exports = Qissues;

function Qissues(screen, options) {
  var q = this;

  this.start = function() {
    screen.key(['q', 'C-c'], function(ch, key) {
      return process.exit(0);
    });
    screen.key(['escape', 'h'], function(ch, key) {
      q.listIssues();
    });

    screen.render();
    q.listIssues();
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
    });
  };

  /**
   * View a single issue
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

  this.editIssue = function(num) {
    screen.readEditor({ value: num }, function(err, data) {
      q.viewIssue(num);
    });
  };

  this.loading = function() {
    screen.children.forEach(function(child) {
      screen.remove(child);
    });

    var box = new blessed.box();
    box.setContent('Loading...');

    screen.append(box);
    screen.render();
  };

  this.empty = function() {
    screen.children.forEach(function(child) {
      screen.remove(child);
    });
    screen.render();
  };

}

util.inherits(Qissues, EventEmitter);
