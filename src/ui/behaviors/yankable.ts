import * as blessed   from 'blessed'
import View           from '../view';
import Behaviour      from '../behaviour';
import Sequencer      from '../services/sequencer';
import HasIssues      from '../views/hasIssues';
import * as Clipboard from '../services/clipboard';

interface YankableOptions {
  keys: YankableKeys
}

interface YankableKeys {
  yankId: string,
  yankTitle: string,
  yankBody: string
}

/**
 * Responsible for yanking issue data into the clipboard
 */
export default class Yankable implements Behaviour {
  private readonly clipboard;
  private view: View;
  private sequencer: Sequencer;

  public readonly events: string[] = [
    'yanked'
  ];

  constructor(clipboard, sequencer: Sequencer) {
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
      .on(view.node, options.keys.yankBody,  this.yank(view, 'body'));
  }

  /**
   * Copies the view's selected issues $field to clipboard
   * If multiple are selected, they are delimited with newlines
   *
   * @param {blessed.Node} view
   * @param {String} field
   * @return {Function}
   */
  private yank(view: HasIssues, field: string): () => Promise<void> {
    return (): Promise<void> => {
      const issues = view.getIssues();
      if (!issues.length) return Promise.resolve();

      const payload = issues.map(issue => issue[field]).join('\n');
      return this.clipboard.copy(payload).then(() => view.emit('yanked'));
    };
  }
}
