'use strict';

module.exports = function(program, args, file) {
  return function(screen) {
    screen.exec(program, args.concat([file]), function(){});
    screen.render();
  };
};
