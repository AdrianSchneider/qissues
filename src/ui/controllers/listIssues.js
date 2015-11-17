'use strict';

module.exports = function(app, ui, keys, tracker) {

  return function(invalidate, focus) {
    var list = ui.views.issueList(
      tracker.getRepository().query(app.getActiveReport(), invalidate),
      focus,
      ui.canvas
    );

    list.on('select', function(num) {
      ui.viewIssue(list.getSelected());
    });

    list.key(keys['issue.lookup'], function() {
      ui.input.ask('Open Issue', ui.screen).then(ui.viewIssue);
    });

    list.key(keys['issue.create.contextual'], function() {
      ui.createIssue(app.getFilters().toValues());
    });

    list.key(keys['issue.create'], function() {
      ui.createIssue();
    });

    list.key(keys.refresh, function() {
      ui.listIssues(true, list.getSelected());
    });

    list.key(keys.web, function() {
      app.get('browser').open(tracker.getNormalizer().getQueryUrl(app.getFilters()));
    });

    list.on('changeset', function(changeSet) {
      ui.applyChangeset(changeSet);
    });
  };

};
