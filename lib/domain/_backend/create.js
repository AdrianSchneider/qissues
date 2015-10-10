var _               = require('underscore');
var yaml            = require('js-yaml');
var Client          = require('./client');
var Metadata        = require('../model/metadata');
var ValidationError = require('../errors/validation');

module.exports = function Create(input, config, metadata, filters, done) {
  Metadata(metadata);

  var issue = getFilterDefaults(filters);
  var jiraissue;

  try {
    var data = _.extend(
      {},
      getFilterDefaults(filters),
      parseYaml(input)
    );

    console.error('input = ', JSON.stringify(data, null, 2));

    data = applyFuzzyMatcher(data, metadata);
    jiraIssue = issueToJira(data);
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

  if(data.priority) {
    data.priority = data.priority.charAt(0).toUpperCase() + data.priority.substring(1);
  }

  if(data.sprint) {
    data.sprint = metadata.matchSprint(data.sprint).name;
  }

  return data;
}

/**
 * Sets up defaults from filters
 * @param FilterSet filters
 * @return object
 */
function getFilterDefaults(filters) {
  var out = {};
  if(!filters) return out;

  var filteredProjects = filters.getValuesByType('project');
  if(filteredProjects.length == 1) {
    out.project = filteredProjects[0];
  }

  var filteredAssignees = filters.getValuesByType('assignee');
  if(filteredAssignees.length == 1) {
    out.assignee = filteredAssignees[0];
  }

  var filteredSprints = filters.getValuesByType('sprint');
  if(filteredSprints.length == 1) {
    out.sprint = filteredSprints[0];
  }

  return out;
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
  if(issue.priority) {
    out.fields.priority = { name: issue.priority };
  }
  if(issue.sprint) {
    out.fields.sprint = { name: sprint.name };
  }

  console.error('POST ' + JSON.stringify(out, null, 2));

  return out;
}
