import * as _                   from 'underscore';
import * as blessed             from 'blessed';
import message                  from './message';
import { nextIndex, prevIndex } from '../../util/circularArray'

/**
 * Extends the base List type with search functionality
 */
export default class List extends blessed.List {
  private activeSearch: string;
  private activeSelection: boolean;
  private selected;
  private searchResults;
  private resultNumber;
  private parentElement;

  protected items;
  protected key;
  protected screen;
  protected select;
  protected issues;
  protected getItemIndex;

  constructor(options: Object) {
    super(options);
    this.activeSearch = '';
    this.activeSelection = false;
    this.selected;
    this.startListening();
  }

  private startListening() {
    this.searchResults = [];
    this.resultNumber = -1;

    this.key('/', this.search);
    this.key('n', this.nextResult);
    this.key('S-x', this.clearSelection);
    this.key('x', this.toggle);
    this.key('S-n', this.prevResult);
    this.key(['escape', 'space'], this.clearSearch);
  }

  /**
   * Overide setItems, specifying originalContent for each item
   */
  public setItems(items: string[]) {
    super.setItems.call(this, items);
    this.items.forEach(item => item.originalContent = item.content);
  }

  /**
   * Starts a new search, and begins capturing input
   */
  public search() {
    const input = new blessed.Textbox({
      parent: this.parentElement,
      bottom: 0,
      right: 0,
      width: 50,
      height: 1,
      style: {
        fg: 'white',
        bg: 'lightblack'
      }
    });

    input.readInput((err, text) => {
      this.parentElement.remove(input);
      this.screen.render();

      if(!text || !text.length) return;
      this.activeSearch = text;

      this.items.forEach(this.redraw);
      this.searchResults = this.items.filter(this.isResult);
      if(!this.searchResults.length) {
        message(this.screen, 'Pattern not found');
        return this.clearSearch();
      }

      this.resultNumber = -1;
      this.nextResult();
      this.screen.render();
    });

    this.screen.render();
  }

  /**
   * Skips to the next search result (circular)
   */
  public nextResult() {
    if (!this.searchResults.length) return;
    this.resultNumber = nextIndex(this.searchResults, this.resultNumber);
    this.select(this.searchResults[this.resultNumber]);
    this.screen.render();
  }

  /**
   * Skips to the previous search result (circular)
   */
  public prevResult() {
    if (!this.searchResults.length) return;
    this.resultNumber = prevIndex(this.searchResults, this.resultNumber);
    this.select(this.searchResults[this.resultNumber]);
    this.screen.render();
  }

  /**
   * Clears the search state
   */
  public clearSearch() {
    this.searchResults = [];
    this.resultNumber = -1;
    this.activeSearch = '';
    this.items.forEach(this.redraw);
    this.screen.render();
  }

  /**
   * Toggles selection of an item
   */
  public toggle() {
    var key = this.issues.get(this.selected).getId();
    var index = this.selected.indexOf(key);
    var oldActiveSelection = this.activeSelection;

    if (index === -1) {
      this.selected.push(key);
    } else {
      this.selected.splice(index, 1);
    }

    this.activeSelection = this.selected.length > 0;
    if(this.activeSelection != oldActiveSelection) {
      this.items.forEach(this.redraw);
    } else {
      this.redraw(this.items[this.selected]);
    }

    this.screen.render();
  }

  /**
   * Clears the active selection
   */
  public clearSelection() {
    this.activeSelection = false;
    this.selected = [];
    this.items.forEach(this.redraw);
    this.screen.render();
  }

  /**
   * Redraws an item in the list
   */
  private redraw(item: blessed.Box) {
    item.content = this.getDecorated(item);
  }

  /**
   * Redraws an item based on the state, decorating with optional markers
   *
   * Since markers can either wrap or prefix, we first check to see if any items match the marker
   * before attempting to draw it
   *
   * Then, draw the item, by decorating once for each valid marker
   *
   * @param {blessed.Box} item
   * @return {String} decorated item content
   */
  private getDecorated(item: blessed.Box): string {
    return this.getMarkers()
      .filter(marker => marker.activeTest())
      .reduce(function(out, marker) {
        if (marker.test(item)) {
          return marker.activeDecorator(out);
        } else {
          return marker.inactiveDecorator(out);
        }
      }, item.originalContent);
  };

  /**
   * Returns the configured markers
   *
   * name: arbitrary string
   * test: function see which decorator should be applied
   * activeTest: function to see if either decorated should be applied at all
   * activeDecorator: decorator when test is true
   * inactiveDecorator: decorator when test is false
   *
   * @return {Array}
   */
  private getMarkers(): ListMarker[] {
    return [{
      name: 'search',
      test: this.isResult,
      activeTest: () => !!this.activeSearch,
      activeDecorator: text => '{red-fg}*{/red-fg}' + ' ' + text,
      inactiveDecorator: text => '  ' + text
    }, {
      name: 'checked',
      test: this.isChecked,
      activeTest: () => this.selected.length > 0,
      activeDecorator: text => '{yellow-fg}x{/yellow-fg}' + ' ' + text,
      inactiveDecorator: text => '  ' + text
    }];
  };

  /**
   * Checks to see if the item is a search result
   *
   * @param {blessed.Box} item
   * @return {Boolean} true if matching the current search criteria
   */
  private isResult(item: blessed.Box): boolean {
    return (
      this.activeSearch &&
      item.originalContent &&
      item.originalContent.toLowerCase().indexOf(this.activeSearch.toLowerCase()) !== -1
    );
  };

  /**
   * Checks to see if the item is currently checked
   *
   * @param {blessed.Box} item
   * @return {Boolean} true if checked/toggled
   */
  private isChecked(item: blessed.Box): boolean {
    var key = this.issues.get(this.getItemIndex(item)).getId();
    var index = this.selected.indexOf(key);
    return index !== -1;
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
    if (this.selected.length) return this.selected;
    return [this.issues.get(this.selected).getId()];
  };
}

interface ListMarker {
  name: string,
  test: Function,
  activeTest: Function,
  activeDecorator: Function,
  inactiveDecorator: Function
}
