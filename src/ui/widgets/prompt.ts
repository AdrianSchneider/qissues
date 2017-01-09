import * as blessed from 'blessed';

export default function Prompt(text: string, parent) {
  text = text + ' ';

  var form = new blessed.Widgets.FormElement({
    top: 'center',
    left: 'center',
    content: text,
    align: 'left',
    valign: 'middle',
    width: 70,
    height: 5,
    tags: true,
    parent: parent,
    padding: { left: 1, right: 1, top: 0, bottom: 0 },
    border: 0,
    style: {
      fg: 'white',
      bg: 'lightblack',
      hover: {
        bg: 'green'
      }
    }
  });

  var input = new blessed.Widgets.TextboxElement({
    top: 'center',
    right: 2,
    padding: 0,
    height: 1,
    width: <number>form['width'] - text.length - <number>form['padding']['left'] - <number>form['padding']['right'] - 2,
    input: true,
    tags: true,
    parent: form,
    border: 0,
    style: {
      fg: 'black',
      bg: 'yellow'
    }
  });

  input.on('remove', function() {
    parent.remove(form);
  });

  input.remove = function() {
    parent.remove(form);
    parent.render();
  };

  parent.screen.render();
  return input;
}
