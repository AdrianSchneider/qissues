import Id               from './id';
import Issue            from './issue';
import NewIssue         from './newIssue';
import IssuesCollection from './issues';

interface TrackerRepository {
  /**
   * Creates a new issue in the repository
   */
  createIssue: (data: NewIssue) => Promise<Issue>;

  /**
   * Looks up an issue
   */
  lookup: (num: Id, options?: Object) => Promise<Issue>;

  /**
   * Queries the repository for issues
   */
  query: (report, options?: Object) => Promise<IssuesCollection>;
}

export default TrackerRepository;
