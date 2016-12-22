import Id from './id';

export default class NewComment {
  public readonly message: string;
  public readonly issue: Id;

  constructor(message: string, issue: Id) {
    this.message = message;
    this.issue = issue;
  }
}
