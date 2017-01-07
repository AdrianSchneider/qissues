import * as _           from 'underscore';
import * as Promise     from 'bluebird';
import * as blessed     from 'blessed';
import UiControllers    from './controllers';
import canvas           from './views/canvas';
import messageWidget    from './widgets/message';
import prompt           from './widgets/prompt';
import promptList       from './widgets/promptList';
import Cancellation     from '../domain/errors/cancellation';
import ValidationError  from '../domain/errors/validation';
import MoreInfoRequired from '../domain/errors/infoRequired';
import KeyMapping       from '../app/config/keys';

export default class BlessedInterface {

  private parent: blessed.Widgets.Node;
  private screen: blessed.Widgets.Screen;
  private logger;
  private format;
  private keys: KeyMapping;
  public canvas;

  private static loadingMessage = 'Loading...';

  constructor(screen, logger, format, keys) {
    this.screen = screen;
    this.logger = logger;
    this.format = format;
    this.keys = keys;
    this.canvas = canvas(this.screen);
  }

  /**
   * Capture expectations from the user
   *
   * @param {Expectations} expectations
   * @param {Object} defaults
   * @param {String} draft - last editing attempt
   * @param {Error} error - last error
   */
  public capture(expectations, defaults?, draft?, error?) {
    const data = {};
    return this.format.seed(expectations, defaults || {}, draft || '', error)
      .then(this.editExternally)
      .tap(content => data['content'] = content)
      .then(this.format.parse)
      .then(expectations.ensureValid)
      .catch(ValidationError, e => {
        return this.capture(expectations, defaults, data['content'], e);
      });
  };

  /**
   * Clears the screen and draws a loading indicator
   * @param {String|null} msg
   */
  public showLoading(msg?: string) {
    this.logger.trace('#showLoading');
    this.clearScreen();
    this.canvas.append(messageWidget(this.canvas, msg || 'Loading...', Infinity));
    this.screen.render();
  };

  /**
   * Clears the screen
   */
  public clearScreen() {
    this.logger.trace('#clearScreen');
    this.canvas.children.forEach(child => this.canvas.remove(child));
    this.screen.render();
  };

  /**
   * Shows a thenable message
   *
   * @param {String} msg
   * @param {Number} delay
   * @return {Promise}
   */
  public message(msg: string, delay: number = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
      messageWidget(this.canvas, msg, delay);
      setTimeout(() => resolve(), delay);
    });
  };

  /**
   * Ask the user a question and receive a response
   *
   * @param text - the question to ask
   * @return the answer
   */
  public ask(text: string, parent?: blessed.Widgets.Node): Promise<string> {
    if (!parent) parent = this.parent;
    return new Promise((resolve, reject) => {
      var input = prompt(text, parent);
      input.key(this.keys['input.cancel'], () => {
        parent.remove(input);
        this.screen.render();
        reject(new Cancellation());
      });

      input.readInput((err, text) => {
        input.remove();
        this.respondOrCancel(text, resolve, reject);
      });
    });
  }

  /**
   * Asks the user to pick from a list and returns the promise of the selection
   *
   * @param text - the question to ask
   * @param options - the options to pick from
   * @return promised answer
   */
  public selectFromList(text: string, options: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      var list = promptList(text, parent, options);

      list.on('select', (item, i: number) => {
        this.logger.debug('Selected ' + item.originalContent);
        this.parent.remove(list);
        this.screen.render();
        this.respondOrCancel(item.originalContent, resolve, reject);
      });

      list.key(this.keys.back, () => {
        this.logger.debug('Back; closing promptList');
        this.parent.remove(list);
        this.screen.render();
        reject(new Cancellation());
        return false;
      });
    });
  }

  /**
   * Asks the user to pick from a list using a refreshable data provider
   *
   * @param text - the question to ask
   * @param provider - function providing promised choices
   * @return promised answer
   */
  public selectFromCallableList(text: string, provider: () => Promise<string[]>): Promise<string> {
    return new Promise((resolve, reject) => {
      var list = promptList(text, this.parent, [BlessedInterface.loadingMessage], this.parent);

      var setItems = (options: string[]) => {
        list.setItems(options.map(String));
        this.parent.screen.render();
      };

      list.on('select', (item, i) => {
        this.logger.debug('Selected ' + item.originalContent);
        this.parent.remove(list);
        this.parent.screen.render();
        this.respondOrCancel(item.originalContent, resolve, reject);
      });

      list.key(this.keys.back, () => {
        this.logger.debug('Back; closing promptList');
        this.parent.remove(list);
        this.parent.screen.render();
        reject(new Cancellation());
      });

      list.key(this.keys.refresh, () => {
        this.logger.debug('Refreshing promptList');
        setItems([BlessedInterface.loadingMessage]);
        provider(true).then(setItems);
      });

      provider().then(setItems);
    });
  }

  /**
   * Returns a function which asks a question, with the options as the first argument
   */
  public selectFromListWith(question: string): (options: string[]) => Promise<string> {
    return options => this.selectFromList(question, options);
  }

  /**
   * Asks the user for input via their $EDITOR
   *
   * @param initial - the initial content
   * @return promised answer
   */
  public editExternally(initial: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.screen.readEditor({ value: initial }, (err, read) => {
        const text = read.toString('utf-8');
        if (err) return reject(err);
        if (text === initial) return reject(new Cancellation());
        this.respondOrCancel(text, resolve, reject);
      });
    })
    .catch({ code: 'ENOENT' }, e => {
      throw new Cancellation();
    });
  }

  /**
   * Fulfils the promise if the text is non-empty
   * rejects with a Cancellation otherwise
   *
   * @param text - the entered text
   * @param resolve
   * @param reject
   */
  private respondOrCancel(text: string, resolve: Function, reject: Function) {
    if (text && text !== BlessedInterface.loadingMessage) {
      resolve(text);
    } else {
      reject(new Cancellation());
    }
  }
}
