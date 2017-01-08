import { Widgets }      from 'blessed';
import { EventEmitter } from 'events';
import HasIssues        from './hasIssues';
import View             from '../view';
import List             from '../widgets/list';
import FilterableList   from '../widgets/filterableList';
import Application      from "../../app/main";
import KeyMapping       from '../../app/config/keys';
import Cancellation     from '../../domain/errors/cancellation';
import Id               from '../../domain/model/id';
import Issue            from '../../domain/model/issue';
import IssuesCollection from '../../domain/model/issues';
import Filter           from '../../domain/model/filter';
import BlessedInterface from "../interface";

/**
 * Responsible for managing the main issue list
 */
class IssueList implements View, HasIssues extends EventEmitter {
  public node: Widgets.BlessedElement;
  private issues: IssuesCollection;

  private readonly app: Application;
  private readonly ui: BlessedInterface;
  private readonly keys: KeyMapping;

  constructor(app: Application, ui, keys) {
    super();
    this.app = app;
    this.ui = ui;
    this.keys = keys;
  }

  /**
   * Renders the issue list
   */
  public render(parent: Widgets.BlessedElement, options: IssueListOptions) {
    this.node = this.createList(parent);
    this.issues = options.issues;
    this.renderIssues(this.issues);

    this.node.on('select', (li, i) => {
      this.emit('select', this.issues.getByIndex(i).id);
    });

    this.node.key(this.keys['issue.lookup'], () => {
      this.ui.ask('Open Issue')
        .then(num => this.emit('select', new Id(num)));
    });

    this.node.key(this.keys['issue.create'], () => this.emit('createIssue'));
    this.node.key(this.keys['issue.create.contextual'], () => this.emit('createIssueContextual'));
    this.node.key(this.keys.refresh, () => this.emit('refresh'));

    parent.append(this.node);
    parent.screen.render();
    this.node.focus();

    return this.node;
  }

  private renderIssue(issue: Issue): string {
    return `{yellow-fg}${issue.id}{/yellow-fg}: ${issue.title}`;
  }

  private renderIssues(issues: IssuesCollection) {
    this.node['setItems'](issues.map(this.renderIssue));
  }

  private createList(parent: Widgets.BlessedElement): Widgets.BlessedElement {
    return new FilterableList({
      parent: parent,
      name: 'issues',
      tags: true,
      selectedFg: 'black',
      selectedBg: 'green',
      keys: true,
      vi: true
      // filters: this.app.getFilters(),
      // report: this.app.getActiveReport(),
      // reports: this.app.getReports(),
//      width: parent.getInnerWidth('100%'),
//      height: parent.getInnerHeight('100%'),
//      keyConfig: keys,
//      input: this.input,
//      logger: this.logger,
//      normalizer: this.normalizer,
//      metadata: this.metadata,
    });
  }

  private findLastFocused(list: Widgets.ListElement, focused?: string): number {
    if (!focused) return 0;
    return list.ritems.findIndex(item => {
      return item.toLowerCase().indexOf(focused.toLowerCase()) !== -1;
    }) || 0;
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
    if (!this.issues) return null;
    return this.issues[0];
  }

}

interface IssueListOptions {
  issues: IssuesCollection,
  focus?: string,
}

export default IssueList;
