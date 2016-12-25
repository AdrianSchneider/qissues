import Id       from './id';
import User     from './meta/user';
import Label    from './meta/label';
import Priority from './meta/priority';
import Sprint   from './meta/sprint';
import Project  from './meta/project';
import Status   from './meta/status';
import Type     from './meta/type';

export interface IssueAttributes {
  status?: Status,
  type?: Type,
  priority?: Priority,
  sprint?: Sprint,
  project?: Project,
  assignee?: User,
  reporter?: User,
  dateCreated?: Date,
  dateUpdated?: Date
}

/**
 * Represents an issue from a 3rd party issue tracking system
 */
export default class Issue {
  public readonly id: Id;
  public readonly title: string;
  public readonly description: string;
  public readonly status: Status;

  constructor(id: Id, title: string, description: string, status: Status, attributes: Object, commentCount?: number) {

  }


  /*

  var construct = function() {
    var attributeFunctions = {
      assignee: setAssignee,
      sprint: setSprint,
      type: setType,
      priority: setPriority,
      reporter: setReporter,
      dateCreated: setDateCreated,
      dateUpdated: setDateUpdated,
      project: setProject,
    };

    Object.keys(attributes).forEach(function(attribute) {
      if(typeof attributeFunctions[attribute] === 'undefined') {
        throw new ReferenceError(attribute + ' is not a valid Issue attribute');
      }

      attributeFunctions[attribute](attributes[attribute]);
    });
  };

  var builtIns = {
    id: id,
    title: title,
    description: description,
    status: status
  };

  var setAssignee = function(user) {
    if(!(user instanceof User)) throw new TypeError('assignee must be a valid User');
    attributes.assignee = user;
  };

  var setReporter = function(user) {
    if(!(user instanceof User)) throw new TypeError('reporter must be a valid User');
    attributes.reporter = user;
  };


  var setSprint = function(sprint) {
    if(!(sprint instanceof Sprint)) throw new TypeError('sprint must be a valid Sprint');
    attributes.sprint = sprint;
  };

  var setPriority = function(priority) {
    if(!(priority instanceof Priority)) throw new TypeError('priority must be a valid Priority');
    attributes.priority = priority;
  };

  var setType = function(type) {
    if(!(type instanceof Type)) throw new TypeError('type must be a valid Type');
    attributes.type = type;
  };

  var setProject = function(project) {
    if(!(project instanceof Project)) throw new TypeError('project must be a valid Project');
    attributes.project = project;
  };

  var setDateCreated = function(date) {
    if(!(date instanceof Date)) throw new TypeError('date created must be a valid Date');
    attributes.dateCreated = date;
  };

  var setDateUpdated = function(date) {
    if(!(date instanceof Date)) throw new TypeError('date updated must be a valid Date');
    attributes.dateUpdated = date;
  };

  this.getId = function() {
    return id;
  };

  this.getTitle = function() {
    return title;
  };

  this.getDescription = function() {
    return description;
  };

  this.getStatus = function() {
    return status;
  };

  this.get = function(name) {
    if (typeof builtIns[name] !== 'undefined') {
      return builtIns[name];
    }

    return attributes[name];
  };

  construct();
  */
}
