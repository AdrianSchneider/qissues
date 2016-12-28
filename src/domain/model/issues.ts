import Id    from './id';
import Issue from './issue';

export default class IssuesCollection extends Array {
  private readonly issues: Issue[];

  constructor(issues: Issue[]) {
    super();
    this.issues = issues;
  }

  public get(id: string | Id): Issue {
    return this.issues.find(issue => issue.id.toString() === id.toString());
  }
}
