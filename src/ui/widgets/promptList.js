'use strict';

var blessed = require('blessed');
var List    = require('./list');

/**
 * A prompt for user input
 *
 * @param {String} text
 * @param {blessed.Node} parent
 * @param {Array<String>} options
 * @return {blessed.Node}
 */
module.exports = function(text, parent, options) {
  var list = new List({
    parent: parent,
    width: '40%',
    height: '20%',
    top: 'center',
    left: 'center',
    tags: true,
    bg: 'grey',
    selectedFg: 'black',
    selectedBg: 'yellow',
    label: '{green-fg}' + text + '{/green-fg}',
    keys: true,
    vi: true,
    border: {
      type: 'line',
      fg: 'lightgreen'
    }
  });

  list.setItems(options.map(String));
  list.select(0);
  list.focus();
  list.render();

  parent.render();
  return list;
};
