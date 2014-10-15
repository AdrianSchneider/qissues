var blessed = require('blessed');
var message = require('../widgets/message');
var filterableList = require('../widgets/filterableList');

/**
 * Issues View
 *
 * @param blessed.screen screen
 * @param function       callback to re-query data
 * @return blessed.list
 */
module.exports = function(screen, filters, reports, storage, getData) {
  var list = new filterableList({
    parent: screen,
    filters: filters,
    reports: reports,
    metadata: storage.get('metadata'),
    name: 'issues',
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

  var issues;
  var redraw = function(err, data) {
    list.setItems(data.map(function(row) {
      return '{yellow-fg}' + row.key + '{/yellow-fg}: ' + row.fields.summary;
    }));
    list.select(0);
    screen.render();
  };

  message(screen, 'loading...', Infinity);
  getData(function(err, data) {
    issues = data;
    screen.children.forEach(function(child) {
      screen.remove(child);
    });
    screen.append(list);
    screen.render();
    redraw(err, data);
  });

  filters.on('change', function() {
    message(screen, 'loading...', Infinity);
    getData(redraw);
  });

  list.on('select', function(text, i) {
    list.emit('open', issues[i].key);
  });

  screen.render();
  return list;
};
