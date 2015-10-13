'use strict';

var NewComment = require('./newComment');

module.exports = function trackerNormalizer() {

  /**
   * Converts the required jira comment fields into a new comment
   *
   * @param {Object} data
   * @return {NewComment}
   */
  this.toNewComment = function(data) {
    return new NewComment(data.message);
  };

};
