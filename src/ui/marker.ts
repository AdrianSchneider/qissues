import { Widgets } from 'blessed';

/**
 * Responsible for applying a behaviour's decorators
 * and re-rendering a list item with those markers applied
 */
export default class ListDecorator {
  private readonly markers: ListMarker[];

  constructor(markers) {
    this.markers = markers;
  }

  /**
   * Redraws an item based on the state, decorating with optional markers
   *
   * Since markers can either wrap or prefix, we first check to see if any items match the marker
   * before attempting to draw it
   *
   * Then, draw the item, by decorating once for each valid marker
   */
  public render(item: Widgets.BlessedElement): string {
    return this.markers
      .filter(marker => marker.activeTest())
      .reduce((out, marker) => {
        if (marker.test(item['originalContent'])) {
          return marker.activeDecorator(out);
        } else {
          return marker.inactiveDecorator(out);
        }
      }, item['originalContent']);
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
