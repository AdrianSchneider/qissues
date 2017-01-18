import View from './view';
import { ListMarker } from './marker';

interface Behaviour {
  /**
   * Internal name of this behaviour
   */
  name: string;

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

  /**
   * Serializes the state of a behaviour
   */
  serialize(): Object;

};

export default Behaviour;
