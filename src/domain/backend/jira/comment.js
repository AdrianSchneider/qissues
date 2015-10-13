'use strict';

var sprintf    = require('util').format;
var NewComment = require('../../model/newComment');

module.exports = function JiraCommenter(client) {

  /**
   * Takes a NewComment and persists it to JIRA
   *
   * @param {NewComment} comment
   * @return {Promise}
   */
  return function(comment) {
    if(!(comment instanceof NewComment)) {
      throw new TypeError('Commenter requires a NewComment instance');
    }

    return client.post(
      sprintf('/rest/api/2/issue/%s/comment', comment.getIssue()),
      { body: comment.getMessage() }
    );
  };

};
