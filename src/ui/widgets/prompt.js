'use strict';

var blessed = require('blessed');

/**
 * A prompt for user input
 *
 * @param {String} text
 * @param {blessed.Node} parent
 * @return {blessed.Node}
 */
module.exports = function Prompt(text, parent) {
  var form = new blessed.form({
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

  var input = new blessed.Textbox({
    top: 'center',
    right: 2,
    padding: 0,
    width: form.width - text.length - form.padding.left - form.padding.right - 2,
    height: 1,
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

  parent.render();
  return input;
};
