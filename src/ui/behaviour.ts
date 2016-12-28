import { Widgets } from 'blessed'

interface Behaviour {
  register: (view: Widgets.Node) => void;
};

export default Behaviour;
