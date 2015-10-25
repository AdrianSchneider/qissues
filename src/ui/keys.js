var _ = require('underscore');

module.exports = function(config) {
  return _.extend({
    'up'                      : ['up', 'k'],
    'down'                    : ['down', 'j'],
    'left'                    : ['left', 'h'],
    'right'                   : ['right', 'l'],
    'help'                    : '?',
    'refresh'                 : 'C-r',
    'select'                  : 'enter',
    'back'                    : ['h', 'escape'],
    'exit'                    : 'C-c',
    'web'                     : 'w',
    'issue.lookup'            : 'S-i',
    'issue.create'            : 'C',
    'issue.create.contextual' : 'c',
    'issue.comment.inline'    : 'c',
    'issue.comment.external'  : 'S-c',
  }, config.keys || {});
};
