import { mapObject }      from 'underscore';
import JiraNormalizer     from './normalizer';
import Id                 from '../../model/id';
import Report             from '../../model/report';
import TrackerRepository  from '../../model/trackerRepository';
import Issue              from '../../model/issue';
import IssuesCollection   from '../../model/issues';
import Comment            from '../../model/comment';
import CommentsCollection from '../../model/comments';
import NewIssue           from '../../model/newIssue';
import NewComment         from '../../model/newComment';
import MoreInfoRequired   from '../../errors/infoRequired';
import HttpClient         from '../../shared/httpClient';
import Cache              from '../../../app/services/cache';
import Logger             from '../../../app/services/logger';

interface QueryOptions {
  invalidate?: boolean
}

/**
 * Responsible for all primary tracker interactions with JIRA through the
 * configured JIRA HTTP client
 */
class JiraRepository implements TrackerRepository {
  private client: HttpClient;
  private cache: Cache;
  private normalizer: JiraNormalizer;
  private metadata;
  private logger: Logger;

  public constructor(client: HttpClient, cache: Cache, normalizer, metadata, logger) {
    this.client = client;
    this.cache = cache;
    this.normalizer = normalizer;
    this.metadata = metadata;
    this.logger = logger;
  }

  /**
   * Creates a new issue in JIRA
   */
  public async createIssue(data: NewIssue): Promise<Id> {
    return this.normalizer.toNum(
      (await this.client.post('/rest/api/2/issue', this.normalizer.newIssueToJson(data))).data
    );
  }

  /**
   * Looks up an issue in Jira
   */
  public async lookup(num: Id, opts: QueryOptions = {}): Promise<Issue> {
    return this.normalizer.toIssue((await this.client.get(this.getIssueUrl(num))).data);
  }

  /**
   * Queries JIRA by generating JQL from the report
   */
  public async query(report: Report, options: QueryOptions = {}): Promise<IssuesCollection> {
    const qs = {
      params: {
        maxResults: 500,
        jql: this.normalizer.filterSetToJql(report.filters)
      }
    };

    this.logger.trace('JQL = ' + qs.params.jql);

    return this.normalizer.toIssuesCollection(
      (await this.client.get('/rest/api/2/search', qs)).data
    );
  }

  /**
   * Gets the comments from an issue
   */
  public async getComments(num: Id, options: QueryOptions = {}): Promise<CommentsCollection> {
    return this.normalizer.toCommentsCollection(
      (await this.client.get(this.getIssueUrl(num, '/comment'))).data
    );
  }

  /**
   * Posts a new Comment
   */
  public async postComment(data: NewComment): Promise<Comment> {
    let response = await this.client.post(
      this.getIssueUrl(data.issue, '/comment'),
      this.normalizer.newCommentToJson(data)
    );

    return response.data;
  }

  /**
   * Applies a changeset
   */
  public applyChanges(changes, details): Promise<any> {
    return Promise.reject(new Error('wip'));
    // TODO refactor into cache wrapper
    // secondary key invalidation?
    // this.cache.invalidateAll(key => key.indexOf('issues:') === 0);
    // changes.getIssues().forEach(num => this.cache.invalidate('lookup:' + num));

    // var changeFunctions = {
    //   title    : this.changeTitle,
    //   assignee : this.changeAssignee,
    //   status   : this.changeStatus,
    //   sprint   : this.changeSprint
    // };

    // return Promise.each(changes.getChanges(), function([field, value]) {
    //   if (typeof changeFunctions[field] === 'undefined') {
    //     throw new Error('Jira cannot apply change for field ' + field);
    //   }

    //   return Promise.each(changes.getIssues(), function(issue) {
    //     return changeFunctions[field](issue, value, details);
    //   });
    // });
  }

  private getIssueUrl(num: Id, append?: string): string {
    if (!append) append = '';
    return `/rest/api/2/issue/${num}${append}`;
  }

  private changeTitle(num: Id, title: string): Promise<void> {
    const data = { fields: { summary: title } };
    return this.client.put(this.getIssueUrl(num), data);
  };

  private changeAssignee(num: Id, username: String): Promise<void> {
    const data = { name: username === 'Unassigned' ? null : username };
    return this.client.put(this.getIssueUrl(num, '/assignee'), data);
  };

  private async changeStatus(num: Id, status: string, details?: Object) {
    const transition = await this.metadata.getIssueTransition(num, status);
    const expectations = this.metadata.transitionToExpectations(transition);

    if (expectations.hasRules() && !Object.keys(details).length) {
      throw new MoreInfoRequired('Jira expects more', expectations);
    }

    const data = {
      transition: { id: transition.id },
      fields: mapObject(details, function(value) {
        return { name: value };
      })
    };

    return await this.client.post(this.getIssueUrl(num, '/transitions'), data);
  };

  private changeSprint(num: Id, toSprint: string): Promise<void> {
    if (toSprint === 'Backlog') {
      throw new Error('TODO need to query for current sprint');
    }

    return this.metadata.getSprints()
      .then(sprints => sprints.find(sprint => sprint.getName() === toSprint))
      .then(function(sprint) {

      });
  };
}

export default JiraRepository;
