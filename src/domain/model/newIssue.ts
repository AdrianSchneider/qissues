import User     from './meta/user';
import Label    from './meta/label';
import Priority from './meta/priority';
import Sprint   from './meta/sprint';
import Type     from './meta/type';
import Project  from './meta/project';
import Status   from './meta/status';

export default class NewIssue {
  public readonly title: string;
  public readonly description: string;

  public readonly status?: Status;
  public readonly sprint?: Sprint;
  public readonly assignee?: User;
  public readonly type?: Type;
  public readonly priority?: Priority;
  public readonly project?: Project;

  constructor(title: string, description: string, attributes: NewIssueAttributes) {
    this.title = title;
    this.description = description;
  }

  serialize(): SerializedNewIssue {
    return {
      title: this.title,
      description: this.description
    };
  }

}

interface NewIssueAttributes {
}

interface SerializedNewIssue {
  title: string,
  description: string
}
