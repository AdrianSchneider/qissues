'use strict';

var _ = require('underscore');
var promptList = require('../widgets/promptList');

module.exports = function ReportList(parent, reports) {
  var list = promptList(
    'Reports',
    _.invoke(reports.getReports(), 'getName')
  );

  list.key('x', function() {
    var name = list.items[list.selected].content;
    reports.remove(name);
    list.removeItem(list.selected);
    list.select(0);
    parent.render();
  });

  list.on(['escape', 'h'], function() {
    parent.remove(list);
    parent.render();
  });

  return list;
};
