module.exports = function JiraCreate(client, mapping) {

  var main = function(newIssue) {
    return post(newIssueToJira).then(mapping.toIssue);
  };

  var post = function(postData) {
    return client.post('/', postData);
  };

  var newIssueToJira = function(newIssue) {
    return {};
  };

  return main;
};
