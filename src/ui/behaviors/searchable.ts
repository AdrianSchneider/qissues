// import { widget, Widgets }      from 'blessed';
// import View                     from '../view';
// import { ListMarker }           from '../marker';
// import Behaviour                from '../behaviour';
// import HasIssues                from '../views/hasIssues';
// import { nextIndex, prevIndex } from '../../util/circularArray'
// 
// export interface SearchableOptions {
//   parent: Widgets.BlessedElement,
//   keys: SearchKeys
// }
// 
// interface SearchKeys {
//   search: string | string[],
//   next: string | string[],
//   prev: string | string[],
//   clear: string | string[]
// }
// 
// export default class Searchable implements Behaviour {
// 
//   private view: View;
//   private element: widget.List;
//   private parent: Widgets.BlessedElement;
//   private activeSearch: string = '';
//   private searchResults: string[];
//   private resultNumber: number;
// 
//   private ui;
//   private logger;
// 
//   public marker: ListMarker = {
//     name: 'search',
//     test: this.isResult,
//     activeTest: () => !!this.activeSearch,
//     activeDecorator: text => `{red-fg}*{/red-fg} ${text}`,
//     inactiveDecorator: text => `  ${text}`
//   }; 
// 
//   /**
//    * Attaches to a View
//    */
//   public attach(view: View, options: SearchableOptions): void {
//     if (this.view) throw new Error('Already attached');
// 
//     this.view = view;
//     this.element = this.view.node;
//     this.parent = options.parent;
//     this.startListening(options.keys);
//   }
// 
//   /**
//    * Sets up the listening on the node for events
//    */
//   private startListening(keys: SearchKeys) {
//     this.searchResults = [];
//     this.resultNumber = -1;
//     this.element.key(keys.search, this.search);
//     this.element.key(keys.next, this.nextResult);
//     this.element.key(keys.prev, this.prevResult);
//     this.element.key(keys.clear, this.clearSearch);
//   }
// 
//   /**
//    * Starts a new search, and begins capturing input
//    */
//   private search() {
//     const input = new Widgets.TextboxElement({
//       parent: this.parent,
//       bottom: 0,
//       right: 0,
//       width: 50,
//       height: 1,
//       style: {
//         fg: 'white',
//         bg: 'lightblack'
//       }
//     });
// 
//     this.ui.readInput((err, text) => {
//       if (err) return this.logger.warn(err);
// 
//       this.parent.remove(input);
//       this.parent.screen.render();
// 
//       if(!text || !text.length) return;
//       this.activeSearch = text;
// 
//       this.element['items'].forEach(this.element.redraw);
//       this.searchResults = this.element['items'].filter(this.isResult);
// 
//       if (!this.searchResults.length) {
//         message(this.screen, 'Pattern not found');
//         return this.clearSearch();
//       }
// 
//       this.resultNumber = -1;
//       this.nextResult();
//       this.element.screen.render();
//     });
// 
//     this.element.screen.render();
//   }
// 
//   /**
//    * Cycles forwards through search results
//    */
//   private nextResult() {
//     if (!this.searchResults.length) return;
//     this.resultNumber = nextIndex(this.searchResults, this.resultNumber);
//     this.element.select(this.searchResults[this.resultNumber]);
//     this.element.screen.render();
//   }
// 
//   /**
//    * Cycles backwards through search results
//    */
//   private prevResult() {
//     if (!this.searchResults.length) return;
//     this.resultNumber = prevIndex(this.searchResults, this.resultNumber);
//     this.element.select(this.searchResults[this.resultNumber]);
//     this.element.creen.render();
//   }
// 
//   /**
//    * Clears the search state
//    */
//   public clearSearch() {
//     this.searchResults = [];
//     this.resultNumber = -1;
//     this.activeSearch = '';
//     this.element.items.forEach(this.element.redraw);
//     this.element.screen.render();
//   }
// 
//   /**
//    * Checks to see if the item is a search result
//    *
//    * @param {blessed.Box} item
//    * @return {Boolean} true if matching the current search criteria
//    */
//   private isResult(item: widget.Box): boolean {
//     return (
//       this.activeSearch &&
//       item['originalContent'] &&
//       item['originalContent'].toLowerCase().indexOf(this.activeSearch.toLowerCase()) !== -1
//     );
//   };
// 
// }
