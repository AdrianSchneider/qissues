var yaml            = require('js-yaml');
var Client          = require('./client');
var Metadata        = require('../model/metadata');
var ValidationError = require('../errors/validation');

module.exports = function Create(input, config, metadata, done) {
  Metadata(metadata);

  try {
    var data = applyFuzzyMatcher(parseYaml(input), metadata);
    var jiraIssue = issueToJira(data);
  } catch (e) {
    return done(e);
  }

  var client = new Client(config.hostname, config.username, config.password);
  client.post('/rest/api/2/issue', jiraIssue, function(err, res, body) {
    if(err) return done(err);
    if(res.statusCode != 201) {
      return done(new Error(JSON.stringify(body, null, 2)));
    }

    return done(null, body.key);
  });
};

/**
 * Extracts issue data from the frontmatter-yaml
 *
 * @param string contents
 * @return object title, description, etc
 */
function parseYaml(contents) {
  var parts = contents.split('---');
  var fields = yaml.safeLoad(parts[1]);
  fields.description = parts[2];

  return fields;
}

/**
 * Replaces fuzzy searches with their respective matches
 *
 * @param  object   data
 * @param  Metadata metadata
 * @return object   data with replacements
 */
function applyFuzzyMatcher(data, metadata) {
  data.project = metadata.matchProject(data.project).key;
  data.type = metadata.matchType(data.type).id;

  if(data.assignee) {
    data.assignee = metadata.matchUser(data.assignee).name;
  }

  return data;
}

/**
 * Converts an issue to the JIRA payload
 *
 * @param object issue
 * @return object
 */
function issueToJira(issue) {

  console.error('INPUT ' + JSON.stringify(issue, null, 2));

  var out = {
    fields: {
      project: { key: issue.project },
      summary: issue.title,
      description: issue.description,
      issuetype: { id: issue.type }
    }
  };

  if(issue.assignee) {
    out.fields.assignee = { name: issue.assignee };
  }

  console.error('POST ' + JSON.stringify(out, null, 2));

  return out;
}
