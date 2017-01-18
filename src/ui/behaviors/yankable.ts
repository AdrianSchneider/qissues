import * as Promise from 'bluebird';
import * as blessed from 'blessed'
import View         from '../view';
import Behaviour    from '../behaviour';
import Sequencer    from '../services/sequencer';
import HasIssues    from '../views/hasIssues';
import Clipboard    from '../services/clipboard';

interface YankableOptions {
  keys: YankableKeys
}

interface YankableKeys {
  yankId: string,
  yankTitle: string,
  yankDescription: string
}

/**
 * Responsible for yanking issue data into the clipboard
 */
export default class Yankable implements Behaviour {
  public readonly name: string = 'yankable';
  public readonly events: string[] = ['yanked'];

  private view: View;
  private readonly clipboard: Clipboard;
  private readonly sequencer: Sequencer;

  constructor(clipboard: Clipboard, sequencer: Sequencer) {
    this.clipboard = clipboard;
    this.sequencer = sequencer;
  }

  /**
   * Registers the yankable with the node
   */
  public attach(view: HasIssues, options: YankableOptions): void {
    if (this.view) throw new Error('Yankable already has a view');

    this.view = view;
    this.sequencer
      .on(view.node, options.keys.yankId,    this.yank(view, 'id'))
      .on(view.node, options.keys.yankTitle, this.yank(view, 'title'))
      .on(view.node, options.keys.yankDescription,  this.yank(view, 'description'));
  }

  public serialize() {
    return {

    };
  }

  /**
   * Copies the view's selected issues $field to clipboard
   * If multiple are selected, they are delimited with newlines
   *
   * @param {blessed.Node} view
   * @param {String} field
   * @return {Function}
   */
  private yank(view: HasIssues, field: string): () => Promise<any> {
    return (): Promise<any> => {
      const issues = view.getIssues();
      if (!issues.length) return Promise.resolve();

      const payload = issues.map(issue => issue[field]).join('\n');
      return this.clipboard.copy(payload)
        .then(() => { view.emit('yanked') });
    };
  }
}
