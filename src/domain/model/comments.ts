import Comment               from './comment';
import { SerializedComment } from './comment';

export default class CommentsCollection {
  private readonly comments: Comment[];
  public readonly length: number;

  constructor(comments: Comment[]) {
    this.comments = comments;
    this.length = this.comments.length;
  }

  public map(f: (comment: Comment) => any): Array<any> {
    return this.comments.map(i => f(i));
  }

  public filter(f: (comment: Comment) => boolean): CommentsCollection {
    return new CommentsCollection(this.comments.filter(i => f(i)));
  }

  public getByIndex(i: 0): Comment {
    return this.comments[i];
  }

  public findIndex(predicate: (item: Comment) => boolean): number {
    return this.comments.findIndex(predicate);
  }

  public serialize() {
    return this.comments.map(comment => comment.serialize());
  }

  public static unserialize(comments: SerializedComment[]) {
    return new CommentsCollection(
      comments.map(Comment.unserialize)
    );
  }
}
