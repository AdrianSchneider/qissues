var blessed = require('blessed');

module.exports = function(screen, message) {
  var alert = new blessed.Message({
    width: '25%',
    height: 5,
    top: 'center',
    left: 'center',
    tags: true,
    parent: screen,
    fg: 'black',
    bg: 'lightblue',
    padding: 1,
    border: {
      type: 'bg',
      fg: 'blue'
    }
  });

  return alert.log(message);
};
