import Promise      from 'bluebird';
import prompt       from './widgets/prompt';
import promptList   from './widgets/promptList';
import Cancellation from '../domain/errors/cancellation';

export default class UserInput {
  private parent;
  private keys;
  private logger;

  private static loadingMessage = 'Loading...';

  constructor(parent, keys, logger) {
    this.parent = parent;
    this.keys = keys;
    this.logger = logger;
  }

  /**
   * Ask the user a question and receive a response
   *
   * @param text - the question to ask
   * @return the answer
   */
  public ask(text: string): Promise<string> {
    return new Promise((resolve, reject) => {
      var input = prompt(text, parent);
      input.key(this.keys['input.cancel'], function() {
        this.parent.remove(input);
        this.parent.screen.render();
        reject(new Cancellation());
      });

      input.readInput(function(err, text) {
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

      list.on('select', function(item, i: number) {
        this.logger.debug('Selected ' + item.originalContent);
        this.parent.remove(list);
        this.parent.render();
        this.respondOrCancel(item.originalContent, resolve, reject);
      });

      list.key(this.keys.back, function() {
        this.logger.debug('Back; closing promptList');
        this.parent.remove(list);
        this.parent.screen.render();
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
  public selectFromCallableList(text: string, provider: Function): Promise<string> {
    return new Promise(function(resolve, reject) {
      var list = promptList(text, this.parent, [UserInput.loadingMessage], this.parent);

      var setItems = function(options: string[]) {
        list.setItems(options.map(String));
        this.parent.screen.render();
      };

      list.on('select', function(item, i) {
        this.logger.debug('Selected ' + item.originalContent);
        this.parent.remove(list);
        this.parent.screen.render();
        this.respondOrCancel(item.originalContent, resolve, reject);
      });

      list.key(this.keys.back, function() {
        this.logger.debug('Back; closing promptList');
        this.parent.remove(list);
        this.parent.screen.render();
        reject(new Cancellation());
      });

      list.key(this.keys.refresh, function() {
        this.logger.debug('Refreshing promptList');
        setItems([UserInput.loadingMessage]);
        provider(true).then(setItems);
      });

      provider().then(setItems);
    });
  }

  /**
   * Returns a function which asks a question, with the options as the first argument
   *
   * @param text - question to ask
   * @return function
   */
  public selectFromListWith(text: string): Function {
    return options => this.selectFromList(text, options);
  }

  /**
   * Asks the user for input via their $EDITOR
   *
   * @param initial - the initial content
   * @return promised answer
   */
  public editExternally(initial: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.parent.readEditor({ value: initial }, (err, text) => {
        if (err) return reject(err);
        if (text === initial) return reject(new Cancellation());
        this.respondOrCancel(text, resolve, reject);
      });
    })
    .catch({ code: 'ENOENT' }, function() {
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
    if (text && text !== UserInput.loadingMessage) {
      resolve(text);
    } else {
      reject(new Cancellation());
    }
  }

}
