var blessed = require('blessed');
var filterableList = require('../widgets/filterableList');

/**
 * Issues View
 *
 * @param blessed.screen screen
 * @param function       callback to re-query data
 * @return blessed.list
 */
module.exports = function(screen, reports, getData) {
  var list = new filterableList({
    parent: screen,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    border: {
      type: 'line',
      fg: 'lightblack'
    },
    tags: true,
    selectedFg: 'black',
    selectedBg: 'green',
    keys: true,
    vi: true
  });

  var redraw = function(err, data) {
    list.setItems(data.map(function(row) {
      return '{yellow-fg}' + row.key + '{/yellow-fg}: ' + row.fields.summary;
    }));
    list.select(0);
    screen.render();
  };

  getData(function(err, data) {
    screen.children.forEach(function(child) {
      screen.remove(child);
    });
    screen.append(list);
    screen.render();
    redraw(err, data);
  });

  list.on('filter', function(filters) {
    getData(redraw);
  });

  list.on('select', function(text, i) {
    list.emit('open', data[i].number);
  });

  screen.render();
  return list;
};
