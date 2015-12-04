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
    console.error('data = ' + JSON.stringify(data, null, 4));
    return tracker.getRepository().apply(changeSet, data || {})
      .catch(MoreInfoRequired, function(e) {
        console.error('more?');
        return ui.capture(e.expectations).then(function(moreInfo) {
          return applyChangeSet(changeSet, moreInfo);
        });
      });
  };

  return applyChangeSet;

};
