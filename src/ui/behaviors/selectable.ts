import { widget, Widgets } from 'blessed';
import View                from '../view';
import Behaviour           from '../behaviour';
import { ListMarker }      from '../marker';

interface SelectableOptions {
  parent: Widgets.BlessedElement,
  keys: SelectableKeys
}

interface SelectableKeys {
  multiSelectToggle: string | string[],
  multiSelectClear: string | string[]
}

export default class Selectable implements Behaviour {
  private view: View;
  private activeSelection: boolean = false;
  private element: Widgets.BlessedElement;
  private parent: Widgets.BlessedElement;
  private selected: string[] = [];
  private items: Object[];

  public readonly name: string = 'selectable';


  public marker: ListMarker = {
    name: 'checked',
    test: item => this.isChecked(item),
    activeTest: () => this.selected.length > 0,
    activeDecorator: text => `{yellow-fg}x{/yellow-fg} ${text}`,
    inactiveDecorator: text => `  ${text}`
  };

  /**
   * Attaches to a View
   */
  public attach(view: View, options: SelectableOptions): void {
    if (this.view) throw new Error('Already attached');
    this.view = view;
    this.element = this.view.node;
    this.parent = options.parent;
    this.startListening(options.keys);
  }

  public serialize() {
    return {};
  }

  /**
   * Sets up the listening on the node for events
   */
  private startListening(keys: SelectableKeys) {
    this.selected = [];
    this.element.key(keys.multiSelectToggle, () => this.toggle());
    this.element.key(keys.multiSelectClear, () => this.clearSelection());
  }

  /**
   * Toggles selection of an item
   */
  private toggle() {
    const row = this.view.node['selected'];
    const index = this.selected.indexOf(row);

    if (index === -1) {
      this.selected.push(row);
    } else {
      this.selected.splice(index, 1);
    }

    this.activeSelection = this.selected.length > 0;
    this.view.emit('change.markers');
  }

  /**
   * Clears the active selection
   */
  private clearSelection() {
    this.activeSelection = false;
    this.selected = [];
    this.view.emit('change.markers');
  }

   /**
    * Checks to see if the item is currently checked
    */
   private isChecked(item): boolean {
     const index = this.view.node['getItemIndex'](item);
     return this.selected.indexOf(index) > -1;
   };

 /**
  * Returns the selected issues for editing
  *
  * If a selection was made, those issues will be returned
  * If nothing is selected, it will pick the item under the cursor
  *
  * @return {Array<String>}
  */
 public getSelectedItems(): string[] {
   return this.selected;
  }
}
