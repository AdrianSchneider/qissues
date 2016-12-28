import * as _             from 'underscore';
import Promise            from 'bluebird';
import { format }         from 'util';
import JiraClient         from './client';
import Id                 from '../../model/id';
import TrackerRepository  from '../../model/trackerRepository';
import Issue              from '../../model/issue';
import IssuesCollection   from '../../model/issues';
import CommentsCollection from '../../model/issues';
import NewIssue           from '../../model/newIssue';
import NewComment         from '../../model/newComment';
import MoreInfoRequired   from '../../errors/infoRequired';
import Cache              from '../../../app/services/cache';

interface QueryOptions {
  invalidate: boolean
}

class JiraRepository implements TrackerRepository {
  private client: JiraClient;
  private cache: Cache;
  private normalizer;
  private logger;
  private metadata;

  public constructor(client: JiraClient, cache: Cache, normalizer, logger, metadata) {
    this.client = client;
    this.cache = cache;
    this.normalizer = normalizer;
    this.logger = logger;
    this.metadata = metadata;
  }

  /**
   * Creates a new issue in JIRA
   */
  public createIssue(data: NewIssue): Promise<Issue> {
    return this.client.post('/rest/api/2/issue', this.normalizer.toNewIssueJson(data))
      .then(this.normalizer.toNum);
  }

  /**
   * Looks up an issue in Jira
   */
  public lookup(num: Id, opts: QueryOptions): Promise<Issue> {
    const cacheId = `lookup:${num}`;
    const cached = this.cache.get(cacheId, opts.invalidate);
    if (cached) return Promise.resolve(this.normalizer.toIssue(cached));

    return this.client.get(this.getIssueUrl(num))
      .tap(data => this.cache.set(cacheId, data))
      .then(this.normalizer.toIssue);
  }

  /**
   * Queries JIRA by generating JQL from the report
   */
  public query(report, options: QueryOptions): Promise<IssuesCollection> {
    const requestOpts = { qs: {
      maxResults: 500,
      jql: this.normalizer.filterSetToJql(report.getFilters())
    } };

    this.logger.trace('JQL = ' + requestOpts.qs.jql);

    const cacheId = `issues:${requestOpts.qs.jql}`;
    const cached = this.cache.get(cacheId, options.invalidate);
    if (cached) return Promise.resolve(this.normalizer.toIssuesCollection(cached));

    return this.client.get('/rest/api/2/search', options)
      .tap(data => this.cache.set(cacheId, data))
      .then(this.normalizer.toIssuesCollection);
  }

  /**
   * Gets the comments from an issue
   */
  public getComments(num: Id, options: QueryOptions): Promise<CommentsCollection> {
    const cacheId = 'comments:' + num;
    const cached = this.cache.get(cacheId, options.invalidate);
    if (cached) return Promise.resolve(this.normalizer.toCommentsCollection(cached));

    return this.client.get(this.getIssueUrl(num, '/comment'))
      .tap(data => this.cache.set(cacheId, data))
      .then(this.normalizer.toCommentsCollection);
  }

  /**
   * Posts a new Comment
   */
  public postComment(data: NewComment): Promise<Comment> {
    return this.client.post(
      this.getIssueUrl(data.issue, '/comment'),
      this.normalizer.newCommentToJson(data)
    );
  }

  /**
   * Applies a changeset
   */
  public applyChanges(changes, details): Promise<void> {
    this.cache.invalidateAll(key => key.indexOf('issues:') === 0);
    changes.getIssues().forEach(num => this.cache.invalidate('lookup:' + num));

    var changeFunctions = {
      title    : this.changeTitle,
      assignee : this.changeAssignee,
      status   : this.changeStatus,
      sprint   : this.changeSprint
    };

    return Promise.each(changes.getChanges(), function([field, value]) {
      if (typeof changeFunctions[field] === 'undefined') {
        throw new Error('Jira cannot apply change for field ' + field);
      }

      return Promise.each(changes.getIssues(), function(issue) {
        return changeFunctions[field](issue, value, details);
      });
    });
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

  private changeStatus(num: Id, status: string, details?: Object) {
    return this.metadata.getIssueTransition(num, status).then(function(transition) {
      var expectations = this.metadata.transitionToExpectations(transition);
      if (expectations.hasRules() && !Object.keys(details).length) {
        throw new MoreInfoRequired('Jira expects more', expectations);
      }

      const data = {
        transition: { id: transition.id },
        fields: _.mapObject(details, function(value) {
          return { name: value };
        })
      };

      return this.client.post(this.getIssueUrl(num, '/transitions'), data);
    });
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