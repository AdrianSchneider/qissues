var blessed = require('blessed');

/**
 * Prompt for user input
 *
 * @param string   prompt text
 * @param array    options
 * @param function done   err,text
 */
module.exports = function PromptList(text, options, parent, done) {
  var list = new blessed.List({
    parent: parent,
    width: '30%',
    height: '20%',
    top: 'center',
    left: 'center',
    tags: true,
    bg: 'lightblack',
    selectedFg: 'black',
    selectedBg: 'yellow',
    keys: true,
    vi: true,
    border: {
      type: 'line'
    }
  });

  list.setItems(options);
  list.select(0);
  list.focus();

  list.on('select', function(item, i) {
    parent.remove(list);
    parent.render();
    return done(null, item.content);
  });

  list.key(['escape', 'h'], function() {
    parent.remove(list);
    parent.render();
    done(null, '');
    return false;
  });

  parent.render();
};
