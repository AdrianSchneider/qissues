'use strict';

module.exports = function(app, ui, keys, tracker) {

  /**
   * List Issues Controller
   *
   * @param {Boolean} invalidate - clears cache
   * @param {String} focus - highlight issue matching text
   */
  return function(invalidate, focus) {
    ui.showLoading();

    var list = ui.views.issueList(
      tracker.getRepository().query(app.getActiveReport(), invalidate),
      focus,
      ui.canvas
    );

    list.on('select', function(num) {
      ui.controller.viewIssue(list.getSelected());
    });

    list.key(keys['issue.lookup'], function() {
      ui.input.ask('Open Issue', ui.screen).then(ui.viewIssue);
    });

    list.key(keys['issue.create.contextual'], function() {
      ui.controller.createIssue(app.getFilters().toValues());
    });

    list.key(keys['issue.create'], function() {
      ui.controller.createIssue();
    });

    list.key(keys.refresh, function() {
      ui.controller.listIssues(true, list.getSelected());
    });

    list.key(keys.web, function() {
      app.get('browser').open(tracker.getNormalizer().getQueryUrl(app.getFilters()));
    });

    list.on('changeset', function(changeSet) {
      ui.applyChangeset(changeSet);
    });

    return list;
  };

};
