import Id from './id';
import Issue, { SerializedIssue } from './issue';


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

  public getByIndex(i: 0): Issue {
    return this.issues[i];
  }

  public findIndex(predicate: (item: Issue) => boolean): number {
    return this.issues.findIndex(predicate);
  }

  public serialize(): SerializedIssue[] {
    return this.issues.map(issue => issue.serialize());
  }

  public static unserialize(issues: SerializedIssue[]): IssuesCollection {
    return new IssuesCollection(
      issues.map(Issue.unserialize)
    );
  }
}
