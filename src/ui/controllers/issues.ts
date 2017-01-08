import * as Promise      from 'bluebird';
import Browser           from '../services/browser';
import BlessedInterface  from '../interface';
import Application       from '../../app/main';
import KeyMapping        from '../../app/config/keys';
import Id                from '../../domain/model/id';
import Comment           from '../../domain/model/comment';
import NewComment        from '../../domain/model/newComment';
import { ChangeSet }     from '../../domain/model/changeSet';
import FilterSet         from '../../domain/model/filterset';
import TrackerRepository from '../../domain/model/trackerRepository';
import Cancellation      from '../../domain/errors/cancellation';
import MoreInfoRequired  from '../../domain/errors/infoRequired';
import ViewManager from '../viewManager';
import HasIssues from '../views/hasIssues';

export default class ListIssuesController {
  private readonly app: Application;
  private readonly repository: TrackerRepository;
  private readonly browser: Browser;
  private readonly ui: BlessedInterface;
  private readonly keys: KeyMapping;
  private readonly normalizer;
  private readonly logger;
  private viewManager: ViewManager;

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
    this.ui.showLoading();
    if (options.focus) {
      this.logger.info(`Listing issues focusing on ${options.focus}`);
    } else {
      this.logger.info('Listing issues');
    }

    return this.repository.query(this.app.getActiveReport(), options.invalidate).then(issues => {
      this.logger.debug('Issues loaded. Rendering issuesView');
      const view = <HasIssues>this.viewManager.getView('issues:list', this.ui.canvas, {
        issues,
        focus: options.focus,
        keys: this.keys
      });

      view.on('select', num => {
        this.viewIssue({ num }).catch(err => this.handleError(err, `Could not load ${num}`));
      });

      view.on('refresh', () => this.listIssues({ focus: view.getIssue().id.toString(), invalidate: true }));
      view.on('createIssue', () => this.createIssue());
      view.on('createIssueContextually', () => this.createIssue(this.app.getFilters().toValues()));
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
    const { num } = options;
    this.logger.info('Viewing issue ' + num);

    this.ui.clearScreen();
    this.ui.showLoading(options.invalidate ? 'Refreshing...' : 'Loading ' + num + '...');

    return Promise.all([
      this.repository.lookup(new Id(num), options.invalidate),
      this.repository.getComments(new Id(num), options.invalidate)
    ]).spread((issue, comments) => {
      this.logger.debug('Finished fetching data for single view');

      const view = this.viewManager.getView('issues:view', this.ui.canvas, {
        issue: issue,
        comments: comments
      });

      view.on('back', () => this.listIssues({ focus: num }));
      view.on('refresh', () => this.viewIssue({ num, invalidate: true }));
    });
  }

  /**
   * Creates a new issue
   */
  public createIssue(filters?: FilterSet): Promise<any> {
    this.ui.showLoading();
    return this.ui.capture(this.normalizer.getNewIssueRequirements(), filters)
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
   * Returns a function that will persist a comment for a given id
   */
  private persistComment(num: string): (text: string) => Promise<Comment> {
    return text => this.repository.postComment(new NewComment(text, new Id(num)));
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
  invalidate?: boolean
}
