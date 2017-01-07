import * as _           from 'underscore';
import * as Promise     from 'bluebird';
import * as blessed     from 'blessed';
import BlessedInterface from './interface';
import UiControllers    from './controllers';
import canvas           from './views/canvas';
import messageWidget    from './widgets/message';
import Cancellation     from '../domain/errors/cancellation';
import ValidationError  from '../domain/errors/validation';
import MoreInfoRequired from '../domain/errors/infoRequired';
import Logger           from '../app/services/logger';

export default class BlessedApplication {
  private screen: blessed.Widgets.Screen;
  private ui: BlessedInterface;
  private config;
  private logger: Logger;
  private format;
  private keys;
  private getControllers: () => Promise<UiControllers>;

  constructor(screen, ui, config, logger, format, keys, getControllers) {
    this.screen = screen;
    this.ui = ui;
    this.config = config;
    this.logger = logger;
    this.format = format;
    this.keys = keys;
    this.getControllers = getControllers;
  }

  /**
   * Starts up the user interface
   */
  public start(app, tracker) {
    this.logger.debug('Booting up ui');
    this.screen.append(this.ui.canvas);
    this.screen.render();

    tracker.assertConfigured(this.config.serialize())
      .catch(MoreInfoRequired, e => {
        return this.ui.capture(e.expectations, {}, '', null).then(this.config.save);
      })
      .catch(Cancellation, () => {
        return this.ui.message('Needs config to run.').then(() => app.exit(1));
      })
      .then(() => this.ui.message('Loading Qissues. ? for Help', 2000))
      .then(this.getControllers)
      .then((controllers: UiControllers) => {
        controllers.issues.listIssues();

        app.getActiveReport().on('change', () => {
          this.logger.debug('Changing filters');
          controllers.issues.listIssues();
        });

        this.screen.key(this.keys.help, _.partial(controllers.help, screen));
        this.screen.key(this.keys.exit, () => app.exit(0));
        this.screen.key(this.keys['issue.lookup'], () => {
          this.ui.ask('Open Issue', this.ui.canvas)
            .then(controllers.issues.viewIssue)
            .catch(Cancellation, _.noop);
        });
      })
      .catch(error => {
        this.logger.error('Failed to start qissues');
        this.logger.error(error.stack);
        app.exit(1);
      });
  }
}
