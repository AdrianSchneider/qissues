'use strict';

var MoreInfoRequired = require('../../domain/errors/infoRequired');

module.exports = function(ui, tracker) {

  /**
   * Applies the changeset against the repository,
   * then potentially prompting them for input and trying again
   *
   * @param {ChangeSet} changeSet
   * @param {Object|undefined} data
   * @return {Promise}
   */
  return function(changeSet, data) {
    return tracker.getRepository().apply(changeSet, data || {})
      .then(ui.controller.listIssues)
      .catch(MoreInfoRequired, function(e) {
        ui.capture(e.expectations).then(function(moreInfo) {
          return ui.applyChangeSet(changeSet, moreInfo);
        });
      });
  };

};
