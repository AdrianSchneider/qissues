import Id         from './id';
import NewComment from './newComment';

export default class TrackerNormalizer {
  public toNewComment(data: NewCommentJson): NewComment {
    return new NewComment(data.message, data.issue);
  }
}

interface NewCommentJson {
  issue: Id,
  message: string
}
