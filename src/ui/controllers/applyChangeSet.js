'use strict';

var MoreInfoRequired = require('../../domain/errors/infoRequired');

module.exports = function(ui, tracker) {

  return function(changeSet, data) {
    return tracker.getRepository().apply(changeSet, data || {})
      .catch(MoreInfoRequired, function(e) {
        ui.getExpected(e.expectations).then(function(moreInfo) {
          return ui.applyChangeSet(changeSet, moreInfo);
        });
      });
  };

};
