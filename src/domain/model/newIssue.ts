import Id                               from './id';
import User, { SerializedUser }         from './meta/user';
import Label, { SerializedLabel }       from './meta/label';
import Priority, { SerializedPriority } from './meta/priority';
import Sprint , { SerializedSprint }    from './meta/sprint';
import Project, { SerializedProject }   from './meta/project';
import Type, { SerializedType }         from './meta/type';

export interface NewIssueAttributes {
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
export default class NewIssue {
  public readonly id: Id;
  public readonly title: string;
  public readonly description: string;

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

  constructor(title: string, description: string, attributes: NewIssueAttributes = {}) {
    this.title = title;
    this.description = description;

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

  /**
   * Serializes an issue for storage
   */
  public serialize(): SerializedNewIssue {
    return {
      title: this.title,
      description: this.description,
      project: this.project ? this.project.serialize() : null,
      priority: this.priority ? this.priority.serialize() : null,
      sprint: this.sprint ? this.sprint.serialize() : null,
      label: this.label ? this.label.serialize() : null,
      type: this.type ? this.type.serialize() : null,
      assignee: this.assignee ? this.assignee.serialize() : null,
      reporter: this.reporter ? this.reporter.serialize() : null,
      dateCreated: this.dateCreated ? this.dateCreated.toString() : null,
      dateUpdated: this.dateUpdated ? this.dateUpdated.toString() : null,
      commentCount: this.commentCount
    };
  }

  /**
   * Deserializes an issue from storage
   */
  public static unserialize(serialized: SerializedNewIssue) {
    return new NewIssue(
      serialized.title,
      serialized.description,
      {
        project: serialized.project ? Project.unserialize(serialized.project) : null,
        priority: serialized.priority ? Priority.unserialize(serialized.priority) : null,
        assignee: serialized.assignee ? User.unserialize(serialized.assignee) : null,
        reporter: serialized.reporter ? User.unserialize(serialized.reporter) : null,
        type: serialized.type ? Type.unserialize(serialized.type) : null,
        sprint: serialized.sprint ? Sprint.unserialize(serialized.sprint) : null,
        label: serialized.label ? Label.unserialize(serialized.label) : null,
        dateCreated: serialized.dateCreated ? new Date(serialized.dateCreated) : null,
        dateUpdated: serialized.dateUpdated ? new Date(serialized.dateUpdated) : null,
        commentCount: serialized.commentCount
      }
    );
  }
}

export interface SerializedNewIssue {
  title: string,
  description: string,
  type?: SerializedType,
  project?: SerializedProject,
  priority?: SerializedPriority,
  sprint?: SerializedSprint,
  label?: SerializedLabel,
  assignee?: SerializedUser,
  reporter?: SerializedUser,
  dateCreated?: string,
  dateUpdated?: string,
  commentCount?: number,
}
