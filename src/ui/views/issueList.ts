import { Widgets }      from 'blessed';
import Behaviour        from '../behaviour';
import List             from './list';
import FilterableList   from '../widgets/filterableList';
import Issue            from '../../domain/model/issue';
import IssuesCollection from '../../domain/model/issues';
import KeyMapping       from '../../app/config/keys';

export default class IssueList extends List {

  private list: Widgets.Node;
  private behaviours: Behaviour[];
  private logger;
  private app;
  private ui;

  private keys: KeyMapping;
  private filters;
  private reports;
  private metadata;

  private issues: IssuesCollection;

  public render(issues: Promise<IssuesCollection>, options: IssueListOptions) {

    const list = this.createList(options.parent);
    list.issues = [];

    this.behaviours.forEach(behaviour => behaviour.register(list));
  }

  private createList(parent: Widgets.Node): FilterableList {
    var list = new FilterableList({
      parent: parent,
      filters: this.app.getFilters(),
      report: this.app.getActiveReport(),
      reports: this.app.getReports(),
      input: this.input,
      logger: this.logger,
      normalizer: this.normalizer,
      metadata: this.metadata,
      name: 'issues',
      width: parent.getInnerWidth('100%'),
      height: parent.getInnerHeight('100%'),
      tags: true,
      selectedFg: 'black',
      selectedBg: 'green',
      keys: true,
      keyConfig: keys,
      vi: true
    });

    list.setIssues = setIssues.bind(list);

    return list;
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
    reportsList(this.options.parent, this.options.reports, this.options.report);
  }

}

interface IssueListOptions {
  focus?: string,
  parent: Widgets.Node
}
