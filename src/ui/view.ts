import { EventEmitter } from 'events';
import { Widgets } from 'blessed'

interface View extends EventEmitter {
  node: Widgets.BlessedElement;
  render(parent: Widgets.BlessedElement, data: Object): void;
}

export default View;
