'use strict';

var blessed = require('blessed');

module.exports = function(parent, filters) {
  var view = new blessed.List({
    name: 'filters',
    parent: parent,
    width: '40%',
    height: '20%',
    top: 'center',
    left: 'center',
    tags: true,
    bg: 'lightblack',
    selectedFg: 'black',
    selectedBg: 'yellow',
    keys: true,
    vi: true,
    label: '{green-fg}Filters{/green-fg}',
    border: {
      type: 'line',
      fg: 'lightgreen'
    }
  });

  view.key(['escape', 'h', 'enter'], function() {
    parent.remove(view);
    parent.screen.render();
  });

  view.key(['delete', 'enter', 'x'], function(text, i) {
    filters.remove(view.selected);
    view.removeItem(view.selected);
    parent.remove(view);
    parent.screen.render();
  });

  view.setItems(filters.serialize().map(function(filter) {
    return filter.type + ' = ' + filter.value;
  }));

  view.select(0);
  view.focus();

  parent.screen.render();
};
