import View from './view';
import { ListMarker } from './marker';

interface Behaviour {
  /**
   * Main method that attaches itself to a view
   */
  attach: (view: View, options?: Object) => void;

  /**
   * Optional list of events that this item emits
   */
  events?: string[];

  /**
   * Optional marker that this behaviour can render
   */
  marker?: ListMarker
};

export default Behaviour;
