import * as Promise       from 'bluebird';
import * as blessed       from 'blessed';
import { EventEmitter } from 'events';
import { Widgets }        from 'blessed'
import { format }         from 'util';
import { mapObject }      from 'underscore';
import HasIssues          from './hasIssues';
import View               from '../view';
import Id                 from '../../domain/model/id';
import Issue              from '../../domain/model/issue';
import IssuesCollection   from '../../domain/model/issues';
import CommentsCollection from '../../domain/model/comments';
import wrap               from '../../util/wrap';

interface SingleIssueViewOptions {
  issue: Promise<Issue>,
  comments: Promise<CommentsCollection>
}

/**
 * Responsible for rendering a single issue
 */
class SingleIssueView extends EventEmitter implements View, HasIssues {
  public node: Widgets.BlessedElement;
  private issue: Issue;
  private comments: CommentsCollection;

  /**
   * Renders the view
   * Waits for the promises to resolve before drawing
   */
  public render(parent: Widgets.BlessedElement, options: SingleIssueViewOptions): void {
    this.node = this.buildBox(parent, options);

    options.issue.then(issue => this.issue = issue);
    options.comments.then(comments => this.comments = comments);

    return Promise.all([options.issue, options.comments])
      .then(() => {
        parent.append(this.node);
        this.node.focus();
        this.node.setContent(
          this.renderIssue(this.issue, this.comments, +this.node.width)
        );
        parent.screen.render();
      });
  }

  /**
   * Builds the actual box / node
   */
  private buildBox(parent: Widgets.BlessedElement, options): Widgets.BlessedElement {
    return blessed.box({
      parent: parent,
      // width: parent.getInnerWidth('100%'),
      // height: parent.getInnerHeight('100%'),
      tags: true,
      keys: true,
      vi: true,
      scrollable: true,
      alwaysScroll: true
    });
  }

  /**
   * Renders the view with the issue/comments
   */
  private renderIssue(issue: Issue, comments: CommentsCollection, width: number) {
    return [
      this.buildHeader(issue, width),
      this.buildMeta(issue, width),
      this.buildBody(issue, width),
      this.buildComments(comments, width)
    ].join('\n\n');
  }

  /**
   * Renders the title of the issue
   */
  private buildHeader(issue: Issue, width: number): string {
    return `{bold}{yellow-fg}${issue.id}{/yellow-fg} - ${issue.title}</bold}`;
  }

  /**
   * Renders the metadata of the issue
   */
  private buildMeta(issue: Issue, width: number): string {
    return wrap(
      format(
        '{blue-fg}%s{/blue-fg} %s %s %s\nreported by %s on %s',
        "" + issue.status,
        "" + issue.type,
        "" + issue.assignee ? `assigned to ${issue.assignee}` : 'currently unassigned',
        "" + issue.priority,
        "" + issue.reporter,
        "" + issue.dateCreated
    ), 1, width);
  }

  /**
   * Renders the Body
   */
  private buildBody(issue: Issue, width: number): string {
    return format(
      '{yellow-fg}DESCRIPTION{/yellow-fg}\n\n%s',
      wrap(issue.description || 'No description', 1, width)
    );
  }

  /**
   * Renders the comments
   */
  private buildComments(comments: CommentsCollection, width: number): string {
    let out = '{yellow-fg}COMMENTS{/yellow-fg}';
    if(!comments.length) return out += '    \n\n    No comments';

    return out + comments.map(comment => format(
      '\n\n    {blue-fg}%s{/blue-fg} at {blue-fg}%s{/blue-fg}\n\n%s',
      comment.author,
      this.formatDate(comment.getDate()),
      wrap(comment.message, 2, width)
    )).join('')
  }

  private formatDate(date: Date): string {
    const d = new Date(date.toString());
    return "" + (1+d.getMonth()) + '-' + d.getDate() + '-' + d.getFullYear();
  }

  public getSelected(): Id {
    return null;
  }

  public getIssue(): Issue | null {
    return this.issue;
  }

  public getIssues(): Promise<IssuesCollection> {
    return new IssuesCollection([this.issue]);
  }

}
