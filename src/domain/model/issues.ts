import Id    from './id';
import Issue from './issue';

export default class IssuesCollection {
  private readonly issues: Issue[];
  public readonly length: number;

  constructor(issues: Issue[]) {
    this.issues = issues;
    this.length = this.issues.length;
  }

  public map(f: (issue: Issue) => any): Array<any> {
    return this.issues.map(i => f(i));
  }

  public filter(f: (issue: Issue) => boolean): IssuesCollection {
    return new IssuesCollection(this.issues.filter(i => f(i)));
  }

  public get(id: string | Id): Issue {
    return this.issues.find(issue => issue.id.toString() === id.toString());
  }
}
