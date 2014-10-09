var blessed = require('blessed');

module.exports = function(screen, data) {
  var list = blessed.list({
    parent: screen,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    border: {
      type: 'line'
    },
    tags: true,
    selectedFg: 'black',
    selectedBg: 'green',
    keys: true,
    vi: true
  });

  list.setItems(data.map(function(row) {
    var number = ('0000' + row.number).substr(row.number.length);
    return '{yellow-fg}' + number + '{/yellow-fg} - ' + row.title;
  }));

  list.select(0);

  list.on('select', function(text, i) {
    list.emit('open', data[i].number);
  });

  screen.render();
  return list;
};
