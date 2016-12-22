import User from './meta/user';

export default class Comment {
  public readonly message: string;
  public readonly author: User;
  public readonly date: Date;

  constructor(message: string, author: User, date: Date) {
    this.message = message;
    this.author = author;
    this.date = date;
  }
}
