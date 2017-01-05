import * as blessed from 'blessed'
import View         from '../view';
import Behaviour    from '../behaviour';
import sequencer    from '../events/sequencer';
import HasIssues    from '../views/hasIssues';
import KeyMapping   from '../../app/config/keys';

export default class Yankable implements Behaviour {
  private readonly keys: KeyMapping;
  private readonly clipboard;
  private view: View;

  public readonly events: string[] = [
    'yanked'
  ];

  constructor(keys: KeyMapping, clipboard) {
    this.keys = keys;
    this.clipboard = clipboard;
  }

  /**
   * Registers the yankable with the node
   */
  public attach(view: HasIssues): void {
    if (this.view) throw new Error('Yankable already has a view');

    this.view = view;

    sequencer(view, this.keys.leader, 100)
      .on(this.keys['yank.id'],    this.yank(view, 'id'))
      .on(this.keys['yank.title'], this.yank(view, 'title'))
      .on(this.keys['yank.body'],  this.yank(view, 'body'))
    ;
  }

  private onSequence(sequence: string, cb: Function) {
    this.view.node.on(`sequence:${sequence}', cb);
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
