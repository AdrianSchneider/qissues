import { Widgets } from 'blessed';
import View from './view';

interface ViewState {
  element: Widgets.BlessedElement,
  items: string[]
}

interface ViewStateMap {
  [key: string]: ViewState
}

/**
 * Responsible for applying a behaviour's decorators
 * and re-rendering a list item with those markers applied
 */
export default class ListDecorator {
  private readonly markers: ListMarker[];

  private static key = '__decorated';
  private viewState: ViewStateMap;

  constructor(markers: ListMarker[]) {
    this.markers = markers;
    this.viewState = {};
  }

  /**
   * Sets up all of the necessary handlers to automatically
   * redraw markers.
   */
  public setupRendering(view: View) {
    const config = this.identify(view);
    view.on('change.items', items => this.handleChangeItems(config, items));
    view.on('change.markers', () => this.handleChangeMarkers(config));
  }

  /**
   * Store all of the original content
   */
  protected handleChangeItems(state: ViewState, items: string[]) {
    state.items = items;
    this.handleChangeMarkers(state);
  }

  /**
   * Redraw elements decorated with markers
   */
  protected handleChangeMarkers(state: ViewState) {
    state.element['items'].forEach((item: Widgets.BlessedElement, k: number) => {
      item.content = this.renderItem(state.items[k], item);
    });
  }

  /**
   * Redraw a specific item
   */
  protected renderItem(original: string, element: Widgets.BlessedElement): string {
    return this.markers
      .filter(marker => marker.activeTest())
      .reduce((out, marker) => {
        if (marker.test(element)) {
          return marker.activeDecorator(out);
        } else {
          return marker.inactiveDecorator(out);
        }
      }, original);
  }

  /**
   * Allows us to identify a view
   */
  protected identify(view: View): ViewState {
    if (!view.node[ListDecorator.key]) {
      view.node[ListDecorator.key] = this.generateId(view);
      this.viewState[view.node[ListDecorator.key]] = {
        element: view.node,
        items: view.node['items'] ? view.node['items'].map(i => i.content): []
      };
    }

    const stateConfig = this.viewState[view.node[ListDecorator.key]];
    return stateConfig;
  }

  /**
   * Generates a random new id for a node
   */
  protected generateId(view: View): string {
    return '' + Math.random() + Math.random();
  }
}

export interface ListMarker {
  /**
   * Arbitrary name for this marker
   */
  name: string,

  /**
   * Test to see if the marker should be applid to this element
   * example: is this item selected
   */
  test: (item: Widgets.BlessedElement) => boolean;

  /**
   * Test to see if the marker should be globally active or not
   * example: is there currently an active search
   */
  activeTest: () => boolean,

  /**
   * Decorator to apply when active
   */
  activeDecorator: (text: string) => string,

  /**
   * Decorator to apply when inactive
   */
  inactiveDecorator: (text: string) => string
}
