import { uniq } from 'underscore';
import Id from './id';

export class ChangeSet {
  public readonly issues: Id[];
  public readonly changes: Object;

  constructor(issues: Id[], changes: Object) {
    if (!issues.length) {
      throw new Error('Must change at least one issue');
    }

    if (Object.keys(changes).length > 1) {
      throw new Error('Cannot change multiple properties at once yet');
    }

    this.issues = issues;
    this.changes = changes;
  }
}

export class ChangeSetBuilder {
  private readonly issues: Id[];
  private readonly changes: Object;

  public constructor(issues: Id[] = [], changes: Object = {}) {
    this.issues = issues;
    this.changes = changes;
  }

  public addIssue(issue: Id): ChangeSetBuilder {
    return new ChangeSetBuilder(
      this.issues.concat([issue]),
      { ...this.changes }
    );
  }

  public addIssues(issues: Id[]): ChangeSetBuilder {
    return new ChangeSetBuilder(
      this.issues.concat(issues),
      { ...this.changes }
    );
  }

  public addChange(field: string, value: any): ChangeSetBuilder {
    return new ChangeSetBuilder(
      this.issues.concat([]),
      { ...this.changes, [field]: value }
    );
  }

  public get(): ChangeSet {
    return new ChangeSet(uniq(this.issues), { ...this.changes });
  }
}
