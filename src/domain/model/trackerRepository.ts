import Id                 from './id';
import Issue              from './issue';
import NewIssue           from './newIssue';
import Comment            from './comment';
import NewComment         from './newComment';
import IssuesCollection   from './issues';
import CommentsCollection from './comments';
import { ChangeSet }      from './changeSet';

interface TrackerRepository {
  /**
   * Creates a new issue in the repository
   */
  createIssue: (data: NewIssue) => Promise<Id>;

  /**
   * Looks up an issue
   */
  lookup: (num: Id, options: Object) => Promise<Issue>;

  /**
   * Queries the repository for issues
   */
  query: (report, options: Object) => Promise<IssuesCollection>;

  /**
   * Fetches comments for an issue
   */
  getComments: (num: Id, options) => Promise<CommentsCollection>;

  /**
   * Persists a new comment
   */
  postComment: (data: NewComment) => Promise<Comment>;

  /**
   * Applies a changeset to the repository
   */
  applyChanges: (changes: ChangeSet, moreInfo: Object) => Promise<void>;
}

export default TrackerRepository;
