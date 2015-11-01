'use strict';

var _ = require('underscore');
var promptList = require('../widgets/promptList');

module.exports = function ReportList(parent, reports, activeReport) {
  var list = promptList(
    'Reports',
    parent,
    _.invoke(reports.getReports(), 'getName')
  );

  list.key('x', function() {
    var name = list.items[list.selected].content;
    reports.remove(name);
    list.removeItem(list.selected);
    list.select(0);
    parent.render();
  });

  list.key(['escape', 'h'], function() {
    parent.remove(list);
    parent.render();
  });

  list.on('select', function(item) {
    var report = reports.get(item.content);
    activeReport.replaceFilters(report.getFilters());

    parent.remove(list);
    parent.render();
  });

  return list;
};
