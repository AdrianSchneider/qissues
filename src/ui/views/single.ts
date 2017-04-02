import * as blessed       from 'blessed';
import { EventEmitter }   from 'events';
import { Widgets }        from 'blessed'
import { format }         from 'util';
import { mapObject }      from 'underscore';
import HasIssues          from './hasIssues';
import Behaviour          from '../behaviour';
import BlessedInterface   from '../interface';
import View               from '../view';
import Application        from '../../app/main';
import KeyMapping         from '../../app/config/keys';
import Id                 from '../../domain/model/id';
import Issue              from '../../domain/model/issue';
import IssuesCollection   from '../../domain/model/issues';
import CommentsCollection from '../../domain/model/comments';
import wrap               from '../../util/wrap';

interface SingleIssueViewOptions {
  issue: Issue,
  comments: CommentsCollection
}

/**
 * Responsible for rendering a single issue
 */
class SingleIssueView extends EventEmitter implements View, HasIssues {
  public node: Widgets.BlessedElement;
  private issue: Issue;
  private comments: CommentsCollection;

  private readonly app: Application;
  private readonly ui: BlessedInterface;
  private readonly keys: KeyMapping;

  private parent;
  private options;
  private behaviours: Behaviour[] = [];

  constructor(app: Application, ui, keys, element, options) {
    super();
    this.app = app;
    this.ui = ui;
    this.keys = keys;
    this.parent = element;
    this.options = options;
    this.render(this.parent, this.options);
  }

  public serialize() {
    return {
      mine: {},
      behaviours: {}
    }
  }

  public onAddBehaviour(behaviour: Behaviour) {
    this.behaviours.push(behaviour);
  }


  /**
   * Renders the view
   * Waits for the promises to resolve before drawing
   */
  public render(parent: Widgets.BlessedElement, options: SingleIssueViewOptions): void {
    this.node = this.buildBox(parent, options);
    this.issue = options.issue;
    this.comments = options.comments;


    this.node.key(this.keys.back, () => this.emit('back'));
    this.node.key(this.keys.refresh, () => this.emit('refresh'));

    this.node.key(this.keys.commentInline, () => this.emit('comment.inline'));
    this.node.key(this.keys.commentExternally, () => this.emit('comment.external'));

    /*
    this.node.key(this.keys['issue.comment.inline'], () => this.ui.ask('Comment')
      .then(this.persistComment(num))
      .then(this.refreshIssue(num))
      .catch(Cancellation, () => {}));

    this.node.key(this.keys['issue.comment.external'], () => this.ui.editExternally('')
      .then(this.persistComment(num))
      .then(this.refreshIssue(num))
      .catch(Cancellation, () => {}));

    this.node.on('changeset', changeSet => this.applyChangeSet(changeSet)
      .then(this.refreshIssue(num)));
      */

    parent.append(this.node);
    this.node.focus();
    this.node.setContent(
      this.renderIssue(this.issue, this.comments, +this.node.width)
    );
    parent.screen.render();
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
    return `{bold}{yellow-fg}${issue.id}{/yellow-fg} - ${issue.title}{/bold}`;
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
      this.formatDate(comment.date),
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

  public getIssues(): IssuesCollection {
    return new IssuesCollection([this.issue]);
  }

}

export default SingleIssueView;
