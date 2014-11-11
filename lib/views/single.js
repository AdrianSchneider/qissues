var _        = require('underscore');
var blessed  = require('blessed');
var editable = require('./editable');

module.exports = function(screen, issue, app) {
  var box = blessed.box({
    parent: screen,
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    tags: true,
    keys: true,
    vi: true,
    scrollable: true,
    alwaysScroll: true,
    border: {
      type: 'line',
      fg: 'lightblack'
    }
  });

  editable(box, app);

  box.setContent(renderIssue(issue));

  screen.append(box);
  screen.render();

  box.getIssue = function() {
    return issue;
  };

  return box;
};

function renderIssue(issue) {
  return buildHeader(issue) + '\n\n' +
    buildMeta(issue) + '\n\n' +
    buildBody(issue) + '\n\n' +
    buildComments(issue);
}

function buildHeader(issue) {
  return '{bold}{yellow-fg}' + issue.key + '{/yellow-fg} - ' + issue.fields.summary + ' {/bold}';
}

function buildMeta(issue) {
  var meta = {
    status      : issue.fields.status.name,
    type        : issue.fields.issuetype ? issue.fields.issuetype.name : '',
    priority    : issue.fields.priority ? issue.fields.priority.name : '',
    dateCreated : new Date(issue.fields.created),
    dateUpdated : new Date(issue.fields.updated),
    reporter    : issue.fields.creator.name,
    assignee    : issue.fields.assignee ? issue.fields.assignee.name : ''
  };

  var out = '';

  out += '\t{blue-fg}' + meta.status + '{/blue-fg} ';
    out += meta.type;
  if(meta.assignee) {
    out += ' assigned to ' + meta.assignee;
  } else {
    out += ' currently unassigned';
  }

  out += ' ' + meta.priority;

  out += '\n\treported by ' + meta.reporter;
    out += ' on ' + meta.dateCreated;

  return out;

}

function buildBody(issue) {
  if(!issue.fields.description) issue.fields.description = 'No description';

  return '{yellow-fg}DESCRIPTION{/yellow-fg}\n\n\t' +
    issue.fields.description.replace(/\n/g, '\n\t');
}

function buildComments(issue) {
  var out = '{yellow-fg}COMMENTS{/yellow-fg}';

  if(!issue.fields.comment.comments.length) return out += '\t\n\n\tNo comments';

  return out + issue.fields.comment.comments.map(function(comment) {
    return '\n\n\t{blue-fg}' + comment.author.name + '{/blue-fg} ' +
      'at {blue-fg}' + formatDate(comment.created) + '{/blue-fg}\n\n\t\t' +
      comment.body;
  }).join('');
}

function formatDate(date) {
  var d = new Date(date);
  return "" + (1+d.getMonth()) + '-' + d.getDate() + '-' + d.getFullYear();
}
