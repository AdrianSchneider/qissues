import {
  JiraIssuesResponse,
  JiraIssueResponse,
  JiraCommentResponse,
  JiraCommentsResponse
}                             from './types';
import * as moment            from 'moment';
import { format }             from 'util';
import Id                     from '../../model/id';
import Issue                  from '../../model/issue';
import { IssueAttributes }    from '../../model/issue';
import IssuesCollection       from '../../model/issues';
import Comment                from '../../model/comment';
import CommentsCollection     from '../../model/comments';
import NewIssue               from '../../model/newIssue';
import NewComment             from '../../model/newComment';
import { NewIssueAttributes } from '../../model/newIssue';
import Expectations           from '../../model/expectations';
import FilterSet              from '../../model/filterset';
import User                   from '../../model/meta/user';
import Status                 from '../../model/meta/status';
import Type                   from '../../model/meta/type';
import Sprint                 from '../../model/meta/sprint';
import Priority               from '../../model/meta/priority';
import Project                from '../../model/meta/project';

export default class JiraNormalizer {
  private readonly metadata;
  private readonly config;
  private readonly createRequirements: Expectations;
  private readonly updateRequirements: Expectations;

  constructor(metadata, config, requirements) {
    this.metadata = metadata;
    this.config = config;
    this.createRequirements = requirements.create(metadata);
    this.updateRequirements = requirements.update(metadata);
  }

  /**
   * Gets the requirements for creating/editing an issue
   *
   * @param {Issue|null} existing
   * @return {Expectations}
   */
  public getNewIssueRequirements(existing?: Issue): Expectations {
    return existing ? this.updateRequirements : this.createRequirements;
  }

  /**
   * Converts the required jira data fields into a new issue
   */
  public toNewIssue(data): NewIssue {
    return new NewIssue(data.title, data.description, (() => {
      let meta: NewIssueAttributes = {};
      if (data.type)     meta.type     = new Type(null, data.type);
      if (data.assignee) meta.assignee = new User(data.assignee);
      if (data.sprint)   meta.sprint   = new Sprint(null, data.sprint);
      if (data.priority) meta.priority = new Priority(data.priority);
      if (data.project)  meta.project  = new Project(data.project);
      return meta;
    })());
  };

  /**
   * Converts the response from a jira issue into an Issue
   */
  public toIssue(response: JiraIssueResponse): Issue {
    return new Issue(
      new Id(response.key),
      response.fields.summary,
      response.fields.description,
      new Status(response.fields.status.name),
      (() => {
        var meta: IssueAttributes = {};

        if (response.fields.created)       meta.dateCreated = moment(response.fields.created).toDate();
        if (response.fields.updated)       meta.dateUpdated = moment(response.fields.updated).toDate();
        if (response.fields.assignee)      meta.assignee    = new User(response.fields.assignee.name);
        if (response.fields.reporter)      meta.reporter    = new User(response.fields.reporter.name);
        if (response.fields.priority)      meta.priority    = new Priority(response.fields.priority.id, response.fields.priority.name);
        if (response.fields.issuetype)     meta.type        = new Type(response.fields.issuetype.name);

        return meta;
      })()
    );
  }

  public toNum(response): string {
    return response.key;
  }

  public toIssuesCollection(response: JiraIssuesResponse): IssuesCollection {
    return new IssuesCollection(response.issues.map(this.toIssue));
  }

  public toComment(response: JiraCommentResponse): Comment {
    return new Comment(
      response.body,
      new User(response.author.key),
      new Date(response.created)
    );
  }

  public toCommentsCollection(response: JiraCommentsResponse): CommentsCollection {
    return new CommentsCollection(response.comments.map(this.toComment));
  }

  public newCommentToJson(comment: NewComment): Object {
    return { body: comment.message };
  }

  public getIssueUrl(num: Id, filters: FilterSet): string {
    return format(
      'https://%s/browse/%s?jql=%s',
      this.config.get('domain'),
      num,
      this.filterSetToJql(filters)
    );
  }

  public getQueryUrl(filters: FilterSet): string {
    return format(
      'https://%s/issues/?jql=%s',
      this.config.get('domain'),
      this.filterSetToJql(filters)
    );
  }

  /**
   * Convert the filters into JQL
   * @param {FilterSet} filters
   * @return {string}
   */
  private filterSetToJql(filters: FilterSet): string {
    return filters.flatten().map(filter => {
      const key: string = filter[0];
      const value: Array<string> = filter[1];

      if (key === 'sprint' && value[0] === 'Active Sprints') {
        return 'sprint in openSprints()';
      }

      return key  +' in (' + value.map(item => "'" + item.replace(/'/g, "\\'") + "'").join(',') + ')';
    }).join(' AND ');
  }

}
