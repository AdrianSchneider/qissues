import * as Promise       from 'bluebird';
import Browser            from '../services/browser';
import BlessedInterface   from '../interface';
import { ViewState }      from '../view';
import ViewManager        from '../viewManager';
import HasIssues          from '../views/hasIssues';
import Application        from '../../app/main';
import KeyMapping         from '../../app/config/keys';
import Id                 from '../../domain/model/id';
import Comment            from '../../domain/model/comment';
import Issue              from "../../domain/model/issue";
import CommentsCollection from "../../domain/model/comments";
import NewComment         from '../../domain/model/newComment';
import { ChangeSet }      from '../../domain/model/changeSet';
import FilterSet          from '../../domain/model/filterSet';
import TrackerRepository  from '../../domain/model/trackerRepository';
import Cancellation       from '../../domain/errors/cancellation';
import MoreInfoRequired   from '../../domain/errors/infoRequired';

export default class ListIssuesController {
  private readonly app: Application;
  private readonly repository: TrackerRepository;
  private readonly browser: Browser;
  private readonly ui: BlessedInterface;
  private readonly keys: KeyMapping;
  private readonly normalizer;
  private readonly logger;
  private viewManager: ViewManager;

  private quickFade: number = 500;
  private fade: number = 1000;

  constructor(app, ui: BlessedInterface, viewManager: ViewManager, keys: KeyMapping, tracker, browser, logger) {
    this.app = app;
    this.ui = ui;
    this.viewManager = viewManager;
    this.repository = tracker.repository;
    this.normalizer = tracker.normalizer;
    this.browser = browser;
    this.keys = keys;
    this.logger = logger;

    // TODO maintain focus here; need access to view
    this.app.getActiveReport().on('change', () => this.listIssues());
  }

  /**
   * Lists issues
   * Failures are passed back up to the caller
   */
  public listIssues(options: ListIssuesOptions = {}): Promise<void> {
    this.ui.showLoading(options.invalidate ? 'Refreshing...' : 'Loading...');

    if (options.focus) {
      this.logger.info(`Listing issues focusing on ${options.focus}`);
    } else {
      this.logger.info('Listing issues');
    }

    return this.repository.query(this.app.getActiveReport(), options).then(issues => {
      this.logger.debug('Issues loaded. Rendering issuesView');
      const view = <HasIssues>this.viewManager.getView('issues:list', this.ui.canvas, {
        issues,
        focus: options.focus,
        keys: this.keys
      });

      view.on('open', num => {
        this.viewIssue({ num }).catch(err => this.handleError(err, `Could not load ${num}`));
      });

      view.on('refresh', () => this.listIssues({ focus: view.getIssue().id.toString(), invalidate: true }));
      view.on('createIssue', () => this.createIssue());
      view.on('createIssueContextual', () => this.createIssue(this.app.getFilters()));
      view.on('changeset', changeSet => {
        this.change(changeSet).then(() => this.listIssues({ invalidate: true }))
      });
    });
  }

  /**
   * Handles interactions around viewing a single issue
   * Failures are passed back up to the caller
   */
  public viewIssue(options: ViewIssueOptions): Promise<void> {
    const { num, state } = options;
    this.logger.info('Viewing issue ' + num);

    this.ui.clearScreen();
    this.ui.showLoading(options.invalidate ? `Refreshing ${num}...` : `Loading ${num}...`);

    return Promise.all([
      this.repository.lookup(new Id(num), options),
      this.repository.getComments(new Id(num), options)
    ]).spread((issue, comments) => {
      this.logger.debug('Finished fetching data for single view');

      const view = this.viewManager.getView('issues:view', this.ui.canvas, {
        issue: issue,
        comments: comments,
        state
      });

      view.on('back', () => this.listIssues({ focus: num }));
      view.on('refresh', () => this.viewIssue({ num, invalidate: true }));
      view.on('comment.inline', () => this.postCommentFrom(() => this.ui.ask('Comment'), num));
      view.on('comment.external', () => this.postCommentFrom(() => this.ui.editExternally(''), num));
    });
  }

  /**
   * Posts a comment from an arbitrary input function
   */
  private postCommentFrom(input: () => Promise<string>, num: string): Promise<void> {
    return input()
      .then(text => this.repository.postComment(new NewComment(text, new Id(num))))
      .then(() => this.viewIssue({ num, invalidate: true }))
      .catch(Cancellation, () => this.ui.message('Cancelled', this.quickFade))
      .catch(Error, e => this.handleError(e, 'Commenting failed'));
  }

  /**
   * Creates a new issue
   */
  public createIssue(filters?: FilterSet): Promise<any> {
    this.ui.showLoading();
    const defaults = filters ? filters.toValues() : {};
    return this.ui.capture(this.normalizer.getNewIssueRequirements(), defaults)
      .then(data => this.repository.createIssue(this.normalizer.toNewIssue(data)))
      .then(num => this.viewIssue({ num: "" + num }))
      .catch(Cancellation, () => {
        this.ui.message('Cancelled').then(() => this.listIssues());
      })
      .catch(Error, error => {
        this.logger.error('Caught error: ' + error.stack);
        this.ui.message(error.message, 5000)
          .then(() => this.listIssues());
      });
  }


  /**
   * Prompts the user for changes
   */
  public change(changes: ChangeSet, moreInfo?: Object): Promise<any> {
    return this.repository.applyChanges(changes, moreInfo || {})
      .catch(MoreInfoRequired, e => this.ui.capture(e.expectations)
        .then(evenMoreInfo => this.change(changes, evenMoreInfo)));
  }

  /**
   * Show an error
   */
  private handleError(error: Error, message?: string): Promise<void> {
    this.logger.error(error.stack);
    return this.ui.message(message || 'An error occurred');
  }
}

interface ListIssuesOptions {
  invalidate?: boolean,
  focus?: string
}

interface ViewIssueOptions {
  num: string,
  invalidate?: boolean,
  state?: Object
}
