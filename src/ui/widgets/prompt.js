var blessed = require('blessed');

/**
 * Prompt for user input
 *
 * @param string   prompt text
 * @param function done   err,text
 */
module.exports = function Prompt(text, parent, done) {
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

  input.key('C-c', function() {
    return done(null, null);
  });

  input.readInput(function(err, text) {
    parent.remove(form);
    parent.render();
    done(err, text);
  });

  parent.render();
};
