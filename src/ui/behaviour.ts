import { Node } from 'blessed'

interface Behaviour {
  register: (view: Node) => any;
};

export default Behaviour;
