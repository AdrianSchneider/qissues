import * as Promise from 'bluebird';
import Browser           from '../browser';
import BlessedInterface  from '../interface';
import KeyMapping        from '../../app/config/keys';
import Id                from '../../domain/model/id';
import Comment           from '../../domain/model/comment';
import NewComment        from '../../domain/model/newComment';
import { ChangeSet }     from '../../domain/model/changeSet';
import FilterSet         from '../../domain/model/filterset';
import TrackerRepository from '../../domain/model/trackerRepository';
import Cancellation      from '../../domain/errors/cancellation';
import MoreInfoRequired  from '../../domain/errors/infoRequired';

interface ListIssuesOptions {
  invalidate?: boolean,
  focus?: string
}

interface ViewIssueOptions {
  num: string,
  invalidate?: boolean
}

export default class ListIssuesController {
  private readonly app;
  private readonly repository: TrackerRepository;
  private readonly browser: Browser;
  private readonly ui: BlessedInterface;
  private readonly keys: KeyMapping;
  private readonly normalizer;
  private readonly logger;
  private views;

  constructor(app, ui: BlessedInterface, views, keys: KeyMapping, tracker, browser, logger) {
    this.app = app;
    this.ui = ui;
    this.views = views;
    this.repository = tracker.repository;
    this.normalizer = tracker.normalizer;
    this.browser = browser;
    this.keys = keys;
    this.logger = logger;
  }

  /**
   * Lists issues
   */
  public listIssues(options: ListIssuesOptions = {}) {
    const view = this.views.issueList;

    if (!view['setup']) {
      view.on('select', num => this.viewIssue({ num }));
      view.on('refresh', () => this.listIssues({ focus: view.getIssue().id, invalidate: true }));
      view.on('createIssue', () => this.createIssue());
      view.on('createIssueContextually', () => this.createIssue(this.app.filters().toValues()));
      view.on('changeset', changeSet => {
        this.change(changeSet).then(() => this.listIssues({
          focus: view.getSelected(),
          invalidate: true
        }))
      });
      view['setup'] = true;
    }

    this.app.getActiveReport().on('change', () => this.listIssues({ focus: view.getIssue() }));

    this.ui.showLoading();

    if (options.focus) {
      this.logger.info(`Listing issues focusing on ${options.focus}`);
    } else {
      this.logger.info('Listing issues');
    }

    return this.repository.query(this.app.getActiveReport(), options.invalidate).then(issues => {
      this.logger.debug('Issues loaded. Rendering issuesView');
      this.views.issueList.render(this.ui.canvas, {
        issues: issues,
        focus: options.focus
      });
    });
  }

  /**
   * Handles interactions around viewing a single issue
   */
  public viewIssue(options: ViewIssueOptions) {
    const { num } = options;
    this.logger.info('Viewing issue ' + num);

    const view = this.views.singleIssue;
    if (!view['setup']) {
      view.on('back', () => this.listIssues({ focus: num }));
      view.on('refresh', () => this.viewIssue({ num, invalidate: true }));
      view['setup'] = true;
    }

    this.ui.clearScreen();
    this.ui.showLoading(options.invalidate ? 'Refreshing...' : 'Loading ' + num + '...');

    Promise.all([
      this.repository.lookup(new Id(num), options.invalidate),
      this.repository.getComments(new Id(num), options.invalidate)
    ]).spread((issue, comments) => {
      this.logger.debug('Finished fetching data for single view');
      view.render(this.ui.canvas, { issue, comments });
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
   * Returns a refresh function for a given issue id
   */
  private refreshIssue(num: string): () => void {
    return () => this.viewIssue({ num: num, invalidate: true });
  }

  /**
   * Returns a function that will persist a comment for a given id
   */
  private persistComment(num: string): (text: string) => Promise<Comment> {
    return text => this.repository.postComment(new NewComment(text, new Id(num)));
  }
}
