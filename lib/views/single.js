var blessed = require('blessed');

module.exports = function(screen, issue) {
  var box = blessed.box({
    parent: screen,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    tags: true,
    border: {
      type: 'line'
    }
  });

  var header = '{bold}{yellow-fg}' + issue.number + '{/yellow-fg} - ' + issue.title + ' {/bold}';
  var meta = '';
  var body = issue.description;

  box.setContent(header + '\n\n' + meta + '\n\n' + body);

  screen.append(box);
  screen.render();

  return box;
};
