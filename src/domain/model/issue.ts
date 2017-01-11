import Id                               from './id';
import User, { SerializedUser }         from './meta/user';
import Label, { SerializedLabel }       from './meta/label';
import Priority, { SerializedPriority } from './meta/priority';
import Sprint , { SerializedSprint }    from './meta/sprint';
import Project, { SerializedProject }   from './meta/project';
import Status, { SerializedStatus }     from './meta/status';
import Type, { SerializedType }         from './meta/type';

export interface IssueAttributes {
  status?: Status,
  type?: Type,
  priority?: Priority,
  label?: Label,
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
  public readonly label?: Label;
  public readonly assignee?: User;
  public readonly reporter?: User;
  public readonly dateCreated?: Date;
  public readonly dateUpdated?: Date;
  public readonly commentCount?: number;

  constructor(id: Id, title: string, description: string, status: Status, attributes: IssueAttributes = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;

    if (attributes.project) this.project = attributes.project;
    if (attributes.type) this.type = attributes.type;
    if (attributes.priority) this.priority = attributes.priority;
    if (attributes.sprint) this.sprint = attributes.sprint;
    if (attributes.label) this.label = attributes.label;
    if (attributes.assignee) this.assignee = attributes.assignee;
    if (attributes.reporter) this.reporter = attributes.reporter;
    if (attributes.dateCreated) this.dateCreated = attributes.dateCreated;
    if (attributes.dateUpdated) this.dateUpdated = attributes.dateUpdated;
    if (attributes.commentCount) this.commentCount = attributes.commentCount;
  }

  public serialize(): SerializedIssue {
    return {
      id: this.id.toString(),
      title: this.title,
      description: this.description,
      status: this.status
    };
  }

  public static unserialize(serialized: SerializedIssue) {
    return new Issue(
      new Id(serialized.id),
      serialized.title,
      serialized.description,
      Status.unserialize(serialized.status)
    );
  }
}

export interface SerializedIssue {
  id: string,
  title: string,
  description: string,
  status?: SerializedStatus,
  project?: SerializedProject,
  priority?: SerializedProject,
  sprint?: SerializedSprint,
  label?: SerializedLabel,
  assignee?: SerializedUser,
  reporter?: SerializedUser,
  dateCreated?: string,
  dateUpdated?: string,
  commentCount?: number,
}
