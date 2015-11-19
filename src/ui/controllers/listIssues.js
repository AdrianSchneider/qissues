'use strict';

module.exports = function(app, ui, input, keys, tracker, browser) {

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
      input.ask('Open Issue', ui.screen).then(ui.viewIssue);
    });

    list.key(keys['issue.create.contextual'], function() {
      ui.controller.createIssue(app.getFilters().toValues());
    });

    list.key(keys['issue.create'], function() {
      ui.controller.createIssue();
    });

    list.key(keys.refresh, function(el) {
      ui.controller.listIssues(true, list.getSelected());
    });

    list.key(keys.web, function() {
      browser.open(tracker.getNormalizer().getQueryUrl(app.getFilters()));
    });

    list.on('changeset', function(changeSet) {
      ui.controller.applyChangeSet(changeSet);
    });

    return list;
  };

};
