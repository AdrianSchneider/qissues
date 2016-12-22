'use strict';

import _                from "underscore";
import Promise          from 'bluebird';
import canvas           from './views/canvas';
import messageWidget    from './widgets/message';
import Cancellation     from '../domain/errors/cancellation';
import ValidationError  from '../domain/errors/validation';
import MoreInfoRequired from '../domain/errors/infoRequired';

export default class BlessedApplication {
  private screen;
  private app;
  private ui;
  private tracker;
  private config;
  private input;
  private logger;
  private format;
  private keys;
  private getDeps;

  constructor(screen, app, ui, tracker, config, input, logger, format, keys, getDeps) {
    this.screen = screen;
    this.app = app;
    this.ui = ui;
    this.tracker = tracker;
    this.config = config;
    this.input = input;
    this.logger = logger;
    this.format = format;
    this.keys = keys;
    this.getDeps = getDeps;
  }

  /**
   * Starts up the user interface
   *
   * @param {String|null} action
   * @param {String|null} id
   */
  public start(action?: string, id?: string) {
    this.logger.debug('Booting up ui');
    this.ui.canvas = canvas(screen);
    this.screen.append(this.ui.canvas);
    this.screen.render();

    this.tracker.assertConfigured(this.config.serialize())
      .catch(MoreInfoRequired, e => {
        return this.ui.capture(e.expectations, {}, '', null).then(this.config.save);
      })
      .catch(Cancellation, () => {
        return this.ui.message('Needs config to run.').then(() => this.app.exit(1));
      })
      .then(_.partial(this.ui.message, 'Loading Qissues. ? for Help', 2000))
      .then(this.getDeps)
      .spread(function(controller, views) {
        this.ui.controller = controller;
        this.ui.views = views;

        if(!action) action = 'listIssues';
        this.ui.controller[action](id);

        this.app.getActiveReport().on('change', function() {
          this.logger.debug('Changing filters');
          this.ui.controller.listIssues();
        });

        this.screen.key(this.keys.help, _.partial(this.ui.controller.help, screen));
        this.screen.key(this.keys.exit, function() { this.app.exit(0); });
        this.screen.key(this.keys['issue.lookup'], function() {
          this.input.ask('Open Issue', this.ui.canvas)
            .then(this.ui.controller.viewIssue)
            .catch(Cancellation, _.noop);
        });
      });
  }

  /**
   * Capture expectations from the user
   *
   * @param {Expectations} expectations
   * @param {Object} defaults
   * @param {String} draft - last editing attempt
   * @param {Error} error - last error
   */
  public capture(expectations, defaults, draft, error) {
    const data = {};
    return this.format.seed(expectations, defaults, draft, error)
      .then(this.input.editExternally)
      .tap(content => data['content'] = content)
      .then(this.format.parse)
      .then(expectations.ensureValid)
      .catch(ValidationError, function(e) {
        return this.ui.capture(expectations, defaults, data['content'], e);
      });
  };

  /**
   * Clears the screen and draws a loading indicator
   * @param {String|null} msg
   */
  showLoading(msg?: string) {
    this.logger.trace('#showLoading');
    this.ui.clearScreen();
    var alert = messageWidget(this.ui.canvas, msg || 'Loading...', Infinity);
    this.ui.canvas.append(alert);
    this.screen.render();
  };

  /**
   * Clears the screen
   */
  public clearScreen() {
    this.logger.trace('#clearScreen');
    this.ui.canvas.children.forEach(child => this.ui.canvas.remove(child));
    this.screen.render();
  };

  /**
   * Shows a thenable message
   *
   * @param {String} msg
   * @param {Number} delay
   * @return {Promise}
   */
  public message(msg: string, delay?: number) {
    if (!delay) delay = 1000;
    return new Promise((resolve, reject) => {
      const m = messageWidget(this.ui.canvas, msg, delay);
      setTimeout(() => resolve(), delay);
    });
  };
}
