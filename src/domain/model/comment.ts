import User               from './meta/user';
import { SerializedUser } from './meta/user';

export default class Comment {
  public readonly message: string;
  public readonly author: User;
  public readonly date: Date;

  constructor(message: string, author: User, date: Date) {
    this.message = message;
    this.author = author;
    this.date = date;
  }

  public serialize() {
    return {
      message: this.message,
      author: this.author.serialize(),
      date: this.date.toString()
    };
  }

  public static unserialize(serialized: SerializedComment): Comment {
    return new Comment(
      serialized.message,
      User.unserialize(serialized.author),
      new Date(serialized.date)
    );
  }
}

export interface SerializedComment {
  message: string,
  author: SerializedUser,
  date: string
}
