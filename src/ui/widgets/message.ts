import { Widgets, widget } from 'blessed';

export default function MessageWidget(parent: Widgets.BlessedElement, message: string, timeout?: number) {
  const alert = new widget.Message({
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
       fg: 0
     }
  });

  alert.log(message, <any>timeout);
  parent.screen.render();
  return alert;
};
