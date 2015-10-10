'use strict';

var async   = require('async');
var sprintf = require('util').format;
var views   = require('./views');
var message = require('./widgets/message');
var prompt  = require('./widgets/prompt');
var spawn   = require('child_process').spawn;

/**
 * Main Qissues application
 *
 * @param {blessed.screen} screen
 * @param {Application} application
 */
module.exports = function BlessedApplication(screen, app) {
  var ui = this;
  var backend = app.get('backend');

  /**
   * Starts up the user interface
   *
   * @param {String|null} action
   * @param {String|null} id
   */
  ui.start = function(action, id) {
    if(!action) action = 'listIssues';
    ui[action](id);

    app.getActiveReport().on('change', function() {
      ui.listIssues();
    });

    setupKeyboard();
  };


  /**
   * Sets up the global keyboard handlers
   */
  var setupKeyboard = function() {
    screen.key('C-c', function(ch, key) {
      app.exit();
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
   * @param {Boolean} invalidate - skip cache
   * @param {String|null} focus - jumps to matching line
   */
  ui.listIssues = function(invalidate, focus) {
    ui.loading(invalidate ? 'Refreshing...' : 'Loading...');

    var list = views.issueList(
      screen,
      app,
      focus,
      backend.query(app.getActiveReport(), !!invalidate)
    );

    list.on('select', function(num) {
      ui.viewIssue(list.getSelected());
    });

    list.key('S-i', function() {
      prompt('Open Issue', screen, function(err, text) {
        ui.viewIssue(text);
      });
    });

    list.key('c', function() {
      ui.createIssue(app.report.getFilters());
    });
    list.key('S-c', function() {
      ui.createIssue();
    });

    list.key('C-r', function() {
      ui.listIssues(true, list.getSelected());
    });

    list.key('w', function() {
      app.get('browser').open(backend.getIssuesUrl(app.getActiveReport()));
    });

    /*
    list.on('issue.change', function(change) {
      ui.loading();
      backend.change(
        change.issue,
        change.changes,
        app.get('config'),
        app.get('cache'),
        function(err) {
          if(err) console.error(err);
          app.listIssues(true, change.issue);
        }
      );
    });
    */

  };

  /**
   * Reloads the metadata and dumps it to stderr
   */
  /*
  this.reloadMetadata = function() {
    ui.loading('Downloading metadata...');
    backend.metadata(config, function(err, data) {
      app.storage.set('metadata', data);
      message(screen, 'Done!');
      app.listIssues(true);
    });
  };
  */

  /**
   * View a single issue
   *
   * @param {String} num - issue number
   * @param {Boolean} invalidate
   */
  ui.viewIssue = function(num, invalidate) {
    ui.empty();
    ui.loading(invalidate ? 'Refreshing...' : 'Loading ' + num + '...');
    var view = views.single(screen, app, backend.lookup(num, invalidate));

    view.key(['escape', 'h'], function() {
      ui.listIssues(null, num);
    });

    view.key('C-r', function() {
      ui.viewIssue(num, true);
    });

    view.key('w', function() {
      app.get('browser').open(backend.getIssueUrl(num, app.getActiveReport()));
    });

    view.key('c', function() {
      prompt('Comment', screen, function(err, comment) {
        if(comment && comment.length) {
          backend.comment(num, comment, function(err) {
            if(err) console.error(err);
            ui.viewIssue(num, true);
          });
        }
      });
    });

    view.key('S-c', function() {
      screen.readEditor({ value: '' }, function(err, comment) {
        if(err) console.error(err);
        if(comment && comment.length) {
          backend.comment(num, comment, function(err) {
            if(err) console.error(err);
            ui.viewIssue(num, true);
          });
        }
      });
    });

    view.on('issue.change', function(change) {
      ui.loading();
      backend.change(
        num,
        change.changes,
        app.cache,
        function(err) {
          if(err) console.error(err);
          ui.viewIssue(num, true);
        }
      );
    });
  };

  /**
   * Creates a new issue interactively
   */
  /*
  this.createIssue = function(filters) {
    ui.loading();

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

            ui.loading('Creating issue...');
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
          ui.viewIssue(number);
        }
      );
    });
  };
  */

  /**
   * Edit an issue
   * @param number num issue number
   */
  /*
  this.editIssue = function(num) {
    screen.readEditor({ value: num }, function(err, data) {
      ui.viewIssue(num);
    });
  };
  */

  /***
   * Clears the screen and draws a loading indicator
   * @param {String|null} msg 
   */
  this.loading = function(msg) {
    ui.empty();
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
};
