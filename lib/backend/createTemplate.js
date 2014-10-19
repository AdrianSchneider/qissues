var _      = require('underscore');
var yaml   = require('js-yaml');
var Client = require('./client');

/**
 * Creates the template for a new issue
 *
 * @param object    config
 * @param FilterSet filters
 * @param Metadata  metadata
 * @param function  done
 */
module.exports = function CreateTemplate(config, filters, metadata, done) {
  var client = new Client(config.hostname, config.username, config.password);

  var allowed = getAllowed(metadata, filters);

  var requiredFields = ['title', 'project', 'type'];
  var optionalFields = ['assignee', 'sprint', 'priority'];

  var requiredData = createEmptyYaml(requiredFields, allowed);
  var optionalData = createEmptyYaml(optionalFields, allowed);

  var output = [
    '---',
    requiredData,
    '# Optional fields',
    optionalData + '---',
  ];

  done(null, output.join('\n'));
};

function getAllowed(metadata, filters) {
  return _.extend({
    project: _.pluck(metadata.projects, 'key'),
    type: _.uniq(metadata.projects.reduce(function(out, item) {
      _.each(item.issuetypes, function(type) {
        out.push(type.name);
      });
      return out;
    }, [])),
    priority: [1, 2, 3, 4, 5],
    assignee: _.pluck(metadata.users, 'name')
  }, getInferences(filters));
}

function createEmptyYaml(fields, allowed) {
  console.error('allowed = ', allowed);
  var data = yaml.safeDump(fields.reduce(function(out, key) {
    out[key] = '';
    if(typeof allowed[key] !== 'undefined' && allowed[key].length == 1) {
      delete out[key];
    }
    return out;
  }, {}));

  var counter = 0;
  while (data.indexOf(': ""') !== -1) {
    counter++;
    data = data.replace(': ""',  ": ");
    if(counter > 10) {
      console.error('FAIL');
      process.exit(1);
    }
  }

  data = data.split('\n').map(function(row) {
    var parts = row.split(':');
    if(parts.length <= 1) {
      return parts;
    }

    var field = parts[0];
    if(typeof allowed[field] !== 'undefined') {
      row += ' # [' + allowed[field].join(', ') + ']';
    }

    return row;
  }).join('\n');

  return data;
}

/**
 * Creates an object of inferences from the filters
 *
 * @param FiltserSet|null fields
 * @return object
 */
function getInferences(filters) {
  var out = {};
  if(!filters) return out;

  var filteredProjects = filters.getValuesByType('project');
  if(filteredProjects.length) {
    out.project = filteredProjects;
  }

  var filteredAssignees = filters.getValuesByType('assignee');
  if(filteredAssignees.length) {
    out.assignee = filteredAssignees;
  }

  return out;
}
