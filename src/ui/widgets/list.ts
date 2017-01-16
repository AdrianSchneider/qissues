import * as blessed from 'blessed';

/**
 * Extends the base List type with search functionality
 */
export default class List extends blessed.widget.List {

  constructor(options) {
    super(options);
  }

  public setItems(items: blessed.Widgets.BlessedElement[]) {
    this.emit('change.items', items);
    super.setItems(items);
  }

}
