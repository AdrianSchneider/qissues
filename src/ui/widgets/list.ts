import * as _                   from 'underscore';
import * as blessed             from 'blessed';
import message                  from './message';
import { nextIndex, prevIndex } from '../../util/circularArray'
import IssuesCollection         from '../../domain/model/issues';

/**
 * Extends the base List type with search functionality
 */
export default class List extends blessed.widget.List {
  private activeSearch: string;
  private activeSelection: boolean;
  private selected;
  private searchResults;
  private resultNumber;
  private parentElement;
  protected options;

  public issues: IssuesCollection;
  protected items: string[];

  // protected items;
  // protected screen;
  // protected select;
  // protected issues;
  // protected getItemIndex;

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
   * Redraws an item in the list
   */
  private redraw(item: blessed.widget.Box) {
    item.content = this.getDecorated(item);
  }
}

interface ListMarker {
  name: string,
  test: Function,
  activeTest: Function,
  activeDecorator: Function,
  inactiveDecorator: Function
}
