import { uniq } from 'underscore';
import Id from './id';

export class ChangeSet {
  public readonly issues: Id[];
  public readonly changes: Object;

  constructor(issues: Id[], changes: Object) {
    if (Object.keys(changes).length > 1) {
      throw new Error('Cannot change multiple properties at once yet');
    }

    this.issues = issues;
    this.changes = changes;
  }
}

export class ChangeSetBuilder {
  public issues: Id[];
  public changes: Object;

  public addIssue(issue: Id): ChangeSetBuilder {
    this.issues = uniq(this.issues.concat([issue]));
    return this;
  }

  public addChange(field: string, value: any): ChangeSetBuilder {
    this.changes[field] = value;
    return this;
  }

  public get(): ChangeSet {
    return new ChangeSet(this.issues, this.changes);
  }
}
