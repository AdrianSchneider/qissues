import * as blessed from 'blessed';

export default function Prompt(text: string, parent) {
  text = ` ${text} `;
  const width = 70;

  var form = new blessed.widget.Form({
    top: 'center',
    left: 'center',
    content: text,
    align: 'left',
    valign: 'middle',
    width: width,
    height: 5,
    tags: false,
    parent: parent,
    border: 0,
    style: {
      fg: 'white',
      bg: 'lightblack',
      hover: {
        bg: 'green'
      }
    }
  });

  var input = new blessed['Textbox']({
    top: 'center',
    left: text.length + 1,
    padding: 0,
    height: 1,
    width: width - text.length - <number>form['padding']['left'] - <number>form['padding']['right'] - 4,
    input: true,
    tags: false,
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
    parent.screen.render();
  };

  parent.screen.render();
  return input;
}
