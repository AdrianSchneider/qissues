'use strict';

module.exports = function(app, ui, tracker) {

  return function(invalidate, focus) {
    var list = ui.views.issueList(invalidate, focus);

    list.on('select', function(num) {
      ui.viewIssue(list.getSelected());
    });

    list.key(ui.keys['issue.lookup'], function() {
      ui.input.ask('Open Issue', ui.screen).then(ui.viewIssue);
    });

    list.key(ui.keys['issue.create.contextual'], function() {
      ui.createIssue(app.getFilters().toValues());
    });

    list.key(ui.keys['issue.create'], function() {
      ui.createIssue();
    });

    list.key(ui.keys.refresh, function() {
      ui.listIssues(true, list.getSelected());
    });

    list.key(ui.keys.web, function() {
      app.get('browser').open(tracker.getNormalizer().getQueryUrl(app.getFilters()));
    });

    list.on('changeset', function(changeSet) {
      ui.applyChangeset(changeSet);
    });
  };

};
