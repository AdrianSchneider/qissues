import { Message } from 'blessed';

export default function MessageWidget(parent, message: string, timeout?: number) {
  const alert = new Message({
    width: '35%',
    height: 5,
    top: 'center',
    left: 'center',
    tags: true,
    parent: parent,
    fg: 'white',
    bg: 'lightblack',
    padding: 1,
    border: {
      type: 'bg',
      fg: 'blue'
    }
  });

  alert.log(message, timeout);
  parent.screen.render();
  return alert;
};
