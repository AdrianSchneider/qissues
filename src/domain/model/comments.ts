import Comment from './comment';

export default class CommentsCollection extends Array {
  private readonly comments: Comment[];

  constructor(comments: Comment[]) {
    super();
    this.comments = comments;
  }
}
