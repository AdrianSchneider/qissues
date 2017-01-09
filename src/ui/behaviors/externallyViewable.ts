import Behaviour         from '../behaviour';
import HasIssues         from '../views/hasIssues';
import Browser           from '../services/browser';
import Id                from '../../domain/model/id';
import Issue             from '../../domain/model/issue';
import TrackerNormalizer from '../../domain/model/trackerNormalizer';
import FilterSet         from '../../domain/model/filterSet';

interface ExternallyViewableOptions {
  /**
   * The key to listen for to trigger browser opening
   */
  keys: Keys

  /**
   * Function that returns the filters
   */
  getFilters: () => FilterSet;
}

interface Keys {
  web: string | string[]
}

/**
 * Responsible for responding to browser open requests
 * and takes the current issue or query and opens it
 * in the browser
 */
export default class ExternallyViewable implements Behaviour {
  private view: HasIssues;
  private browser: Browser;
  private normalizer: TrackerNormalizer;

  constructor(browser: Browser, normalizer: TrackerNormalizer) {
    this.browser = browser;
    this.normalizer = normalizer;
  }

  public attach(view: HasIssues, options: ExternallyViewableOptions): void {
    if (this.view) throw new Error('Already attached');

    this.view = view;
    this.view.node.key(
      options.keys.web,
      () => this.browser.open(this.getUrl(options.getFilters()))
    );
  }

  private getUrl(filters: FilterSet): string {
    const len = this.view.getIssues().length;

    if (len == 1) {
      return this.normalizer.getIssueUrl(
        this.view.getIssue().id,
        filters
      );
    }

    return this.normalizer.getQueryUrl(filters);
  }
}
