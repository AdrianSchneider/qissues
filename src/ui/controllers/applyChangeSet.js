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
  var applyChangeSet = function(changeSet, data) {
    return tracker.getRepository().apply(changeSet, data || {})
      .catch(MoreInfoRequired, function(e) {
        return ui.capture(e.expectations).then(function(moreInfo) {
          return applyChangeSet(changeSet, moreInfo);
        });
      });
  };

  return applyChangeSet;

};
