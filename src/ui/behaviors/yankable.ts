import Promise    from 'bluebird'
import { Node }   from 'blessed'
import Behaviour  from '../behaviour';
import sequencer  from '../events/sequencer';
import KeyMapping from '../../app/config/keys';

export default class YankableBehaviour implements Behaviour {
  private readonly keys: KeyMapping;
  private readonly clipboard;

  constructor(keys: KeyMapping, clipboard) {
    this.keys = keys;
    this.clipboard = clipboard;
  }

  /**
   * Registers the yankable with the node
   */
  public register(view: Node) {
    sequencer(view, this.keys.leader, 100)
      .on(this.keys['yank.id'],    this.yank(view, 'id'))
      .on(this.keys['yank.title'], this.yank(view, 'title'))
      .on(this.keys['yank.body'],  this.yank(view, 'body'))
    ;
  }

  /**
   * Copies the view's selected issues $field to clipboard
   * If multiple are selected, they are delimited with newlines
   *
   * @param {blessed.Node} view
   * @param {String} field
   * @return {Function}
   */
  private yank(view: Node, field: string): Function {
    return (): Promise => {
      var issues = view.getIssues();
      if (!issues.length) return Promise.resolve();

      this.clipboard.copy(issues.getField(field).join('\n'))
        .then(view.clearSelection);
    };
  }
}
