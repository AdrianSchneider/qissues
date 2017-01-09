import { widget, Widgets } from 'blessed';
import View                from '../view';
import Behaviour           from '../behaviour';
import { ListMarker }      from '../marker';

interface SelectableOptions {
  parent: Widgets.BlessedElement,
  keys: SelectableKeys
}

interface SelectableKeys {
  toggle: string | string[],
  clear: string | string[]
}

export default class Selectable implements Behaviour {
  private view: View;
  private activeSelection: boolean = false;
  private element: Widgets.BlessedElement;
  private parent: Widgets.BlessedElement;
  private selected: string[] = [];
  private items: Object[];

  public marker: ListMarker = {
    name: 'checked',
    test: () => false, // this.isChecked,
    activeTest: () => this.selected.length > 0,
    activeDecorator: text => '{yellow-fg}x{/yellow-fg}' + ' ' + text,
    inactiveDecorator: text => '  ' + text
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

  /**
   * Sets up the listening on the node for events
   */
  private startListening(keys: SelectableKeys) {
    // this.element.key(keys.toggle, this.toggle);
    // this.element.key(keys.clear, this.clearSelection);
  }

//   /**
//    * Toggles selection of an item
//    */
//   private toggle() {
//     const key = this.items.find(issue => issue.id == this.selected).id;
//     const index = this.selected.indexOf(key);
//     const oldActiveSelection = this.activeSelection;
//
//     if (index === -1) {
//       this.selected.push(key);
//     } else {
//       this.selected.splice(index, 1);
//     }
//
//     this.activeSelection = this.selected.length > 0;
//     if(this.activeSelection != oldActiveSelection) {
//       this.element['items'].forEach(this.redraw);
//     } else {
//       this.redraw(this.element['items'][this.element.selected]);
//     }
//
//     this.element.screen.render();
//   }
//
//   /**
//    * Clears the active selection
//    */
//   private clearSelection() {
//     this.activeSelection = false;
//     this.element.selected = [];
//     this.element['items'].forEach(this.element.redraw);
//     this.element.screen.render();
//   }
//
//   /**
//    * Checks to see if the item is currently checked
//    */
//   private isChecked(item): boolean {
//     const key = this.issues.get(this.getItemIndex(item)).getId();
//     const index = this.selected.indexOf(key);
//     return index !== -1;
//   };
//
//   /**
//    * Returns the selected issues for editing
//    *
//    * If a selection was made, those issues will be returned
//    * If nothing is selected, it will pick the item under the cursor
//    *
//    * @return {Array<String>}
//    */
//   public getSelectedItems(): string[] {
//     if (this.selected.length) return this.selected;
//     return [this.issues.get(this.selected).id].map(String); //   };
//   }
}
