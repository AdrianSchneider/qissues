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
  dateUpdated?: Date,
  commentCount?: number
}

/**
 * Represents an issue from a 3rd party issue tracking system
 */
export default class Issue {
  public readonly id: Id;
  public readonly title: string;
  public readonly description: string;
  public readonly status: Status;

  public readonly project?: Project;
  public readonly type?: Type;
  public readonly priority?: Priority;
  public readonly sprint?: Sprint;
  public readonly assignee?: User;
  public readonly reporter?: User;
  public readonly dateCreated?: Date;
  public readonly dateUpdated?: Date;
  public readonly commentCount?: number;

  constructor(id: Id, title: string, description: string, status: Status, attributes?: IssueAttributes) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;

    if (!attributes) attributes = {};
    if (attributes.project) this.project = attributes.project;
    if (attributes.type) this.type = attributes.type;
    if (attributes.priority) this.priority = attributes.priority;
    if (attributes.sprint) this.sprint = attributes.sprint;
    if (attributes.assignee) this.assignee = attributes.assignee;
    if (attributes.reporter) this.reporter = attributes.reporter;
    if (attributes.dateCreated) this.dateCreated = attributes.dateCreated;
    if (attributes.dateUpdated) this.dateUpdated = attributes.dateUpdated;
    if (attributes.commentCount) this.commentCount = attributes.commentCount;
  }
}
