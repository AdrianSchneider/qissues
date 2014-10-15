var blessed = require('blessed');

module.exports = function(screen, filters) {
  var view = new blessed.List({
    name: 'filters',
    parent: screen,
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

  view.key(['escape', 'h', 'enter'], function() {
    screen.remove(view);
    screen.render();
  });

  view.key(['delete', 'enter', 'x'], function(text, i) {
    view.removeItem(view.selected);
    filters.remove(view.selected);
    screen.render();
  });

  view.setItems(filters.serialize().map(function(filter) {
    return filter.type + ' = ' + filter.value;
  }));

  view.select(0);
  view.focus();

  screen.render();
};
