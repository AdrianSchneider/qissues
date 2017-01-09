import * as blessed from 'blessed';

export default function(node: blessed.Widgets.Screen) {
  const box = new blessed.widget.Box({
    name: 'canvas',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    padding: { top: 0, bottom: 0, left: 1, right: 1 },
    border: {
      type: 'line',
      fg: <any>'lightblack'
    }
  });

  box['getInnerWidth'] = function(width) {
    var offset = 0;
    if (this.border.left) offset++;
    if (this.border.right) offset++;
    return '' + width + '-' + offset;
  };

  box['getInnerHeight'] = function(width) {
    var offset = 0;
    if (this.border.top) offset++;
    if (this.border.bottom) offset++;
    return '' + width + '-' + offset;
  };

  return box;
};
