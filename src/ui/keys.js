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
    'issue.create'            : 'S-c',
    'issue.create.contextual' : 'c',
    'issue.comment.inline'    : 'c',
    'issue.comment.external'  : 'S-c',
    'input.cancel'            : ['C-c', 'escape'],
    'leader'                  : ',',
    'filter.list'             : 'fl',
    'filter.project'          : 'fp',
    'filter.assignee'         : 'fa',
    'filter.status'           : 'fs',
    'filter.sprint'           : 'fS',
    'reports.list'            : 'rl',
    'reports.save'            : 'rs',
    'change.title'            : 'ct',
    'change.assignee'         : 'ca',
    'change.status'           : 'cs',
    'change.sprint'           : 'cS'
  }, config.keys || {});
};
