import { Widgets }      from 'blessed';
import { EventEmitter } from 'events';
import View             from '../view';
import ListWidget       from '../widgets/list';
import Application      from "../../app/main";
import KeyMapping       from '../../app/config/keys';
import Cancellation     from '../../domain/errors/cancellation';
import Id               from '../../domain/model/id';
import Issue            from '../../domain/model/issue';
import IssuesCollection from '../../domain/model/issues';
import Filter           from '../../domain/model/filter';
import BlessedInterface from "../interface";

/**
 * Responsible for managing the main issue list
 */
class List extends EventEmitter implements View {
  public node: Widgets.BlessedElement;

  private readonly app: Application;
  private readonly ui: BlessedInterface;
  private readonly keys: KeyMapping;
  private parent;
  private options;

  constructor(app: Application, ui, keys, parent, options: Object) {
    super();
    this.app = app;
    this.ui = ui;
    this.keys = keys;
    this.parent = parent;
    this.options = options;
    this.render(this.parent, this.options);
  }

  /**
   * Renders the issue list
   */
  public render(parent: Widgets.BlessedElement, options: Object) {
    this.node = this.createList(options.text, parent);
    this.node.key(this.keys.refresh, () => this.emit('refresh'));

    parent.append(this.node);
    parent.screen.render();
    this.node.focus();

    return this.node;
  }

  private createList(name, parent: Widgets.BlessedElement): Widgets.BlessedElement {
    return new ListWidget(<any>{
      parent: parent,
      searchParent: parent,
      width: '40%',
      height: '20%',
      top: 'center',
      left: 'center',
      tags: true,
      bg: 'grey',
      name: name,
      selectedFg: 'black',
      selectedBg: 'yellow',
      label: '{green-fg}' + name + '{/green-fg}',
      keys: true,
      vi: true,
      border: {
        type: 'line',
        fg: 'lightgreen'
      }
    });
  }
}

export default List;
