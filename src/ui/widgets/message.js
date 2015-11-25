var blessed = require('blessed');

module.exports = function(parent, message, timeout) {
  var alert = new blessed.Message({
    width: '35%',
    height: 5,
    top: 'center',
    left: 'center',
    tags: true,
    parent: parent,
    fg: 'white',
    bg: 'lightblack',
    padding: 1,
    border: {
      type: 'bg',
      fg: 'blue'
    }
  });

  alert.log(message, timeout);
  parent.screen.render();
  return alert;
};
