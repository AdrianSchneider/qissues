import { Widgets }      from 'blessed';
import HasIssues        from './hasIssues';
import View             from '../view';
import List             from '../widgets/list';
import FilterableList   from '../widgets/filterableList';
import Application      from "../../app/main";
import KeyMapping       from '../../app/config/keys';
import Cancellation     from '../../domain/errors/cancellation';
import Issue            from '../../domain/model/issue';
import IssuesCollection from '../../domain/model/issues';
import Filter           from '../../domain/model/filter';

/**
 * Responsible for managing the main issue list
 */
export default class IssueList implements View, HasIssues {
  public node: Widgets.BlessedElement;
  private issues: IssuesCollection;
  private app: Application;

  constructor(app) {
    this.app = app;
  }

  /**
   * Renders the issue list
   */
  public render(parent: Widgets.BlessedElement, options: IssueListOptions) {
    this.node = this.createList(parent);
    options.issues.then(issues => this.issues = issues);
    options.issues.then(issues => {
      parent.screen.render();
    });

    return this.node;
  }

  private createList(parent: Widgets.BlessedElement): Widgets.BlessedElement {
    return new FilterableList({
      parent: parent,
      filters: this.app.getFilters(),
      report: this.app.getActiveReport(),
      reports: this.app.getReports(),
//      input: this.input,
//      logger: this.logger,
//      normalizer: this.normalizer,
//      metadata: this.metadata,
      name: 'issues',
//      width: parent.getInnerWidth('100%'),
//      height: parent.getInnerHeight('100%'),
      tags: true,
      selectedFg: 'black',
      selectedBg: 'green',
      keys: true,
//      keyConfig: keys,
      vi: true
    });
  }

  private findLastFocused(list: Widgets.ListElement, focused?: string): number {
    if (!focused) return 0;
    return list.ritems.findIndex(item => {
      return item.toLowerCase().indexOf(focused.toLowerCase()) !== -1;
    }) || 0;
  }

  private renderIssue(issue: Issue): string {
    return `{yellow-fg}${issue.id}{/yellow-fg}: ${issue.title}`;
  }

  private showFilters() {
    if (!this.filters.serialize().length) {
      return message(this.options.parent, 'No filters defined');
    }

    return filterView(this.options.parent, this.filters);
  }

  private filter(getOptions, message, type) {
    return () => this.input.selectFromCallableList(message, getOptions)
      .then(Filter.addSelectedTo(this.filters, type))
      .catch(Cancellation, () => {})
  }

  private reportsSave() {
    this.input.ask('Save as')
      .then(name => this.reports.addReport(name, this.filters))
      .catch(Cancellation, () => {})
  }

  private showReportsList() {
    reportsList(this.options.parent, this.options.reports, this.options.report); }

  public getIssues(): IssuesCollection {
    return this.issues;
  }

  public getIssue() {
    return this.issues[0];
  }

}

interface IssueListOptions {
  issues: Promise<IssuesCollection>,
  focus?: string,
}
