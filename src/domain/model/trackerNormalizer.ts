import Id         from './id';
import NewComment from './newComment';
import FilterSet  from './filterset';

interface TrackerNormalizer {

  /**
   * Converts a new comment datastructure to a new comment
   */
  toNewComment(data: NewCommentJson): NewComment;

  /**
   * Gets the URL for viewing a single issue
   */
  getIssueUrl(num: Id, filters?: FilterSet): string;

  /**
   * Gets the URL for viewing a query result
   */
  getQueryUrl(filters: FilterSet): string;

}

interface NewCommentJson {
  issue: Id,
  message: string
}

export default TrackerNormalizer;
