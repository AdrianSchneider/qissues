import Issue from './issue';

export default class IssuesCollection extends Array {
  private readonly issues: Issue[];

  constructor(issues: Issue[]) {
    super();
    this.issues = issues;
  }
}
