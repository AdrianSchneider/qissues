import { EventEmitter } from 'events';
import { Widgets }      from 'blessed'
import Behaviour        from './behaviour';

interface View extends EventEmitter {

  /**
   * Represents the actual blessed widget
   */
  node: Widgets.BlessedElement;

  /**
   * Trigger rendering of this view
   */
  render(parent: Widgets.BlessedElement, data: Object): void;

  /**
   * Is called when a behaviour is added
   */
  onAddBehaviour(behaviour: Behaviour): void;

  /**
   * Serialize this view's state into a single object
   * This should always be passable back to a view at render time
   * and should bubble up to all of its behaviours
   */
  serialize(): ViewState;
}

export interface ViewState {
  mine: Object,
  behaviours: BehaviourStateMap
}

interface BehaviourStateMap {
  [key: string]: Object
}

export default View;
