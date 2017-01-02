import { Widgets }             from 'blessed';
import message          from './message';
import List             from './list';
import sequencer        from '../events/sequencer';
import * as filterView  from '../views/filters';
import * as reportsList from '../views/reports';
import * as f           from '../../util/f';
import * as Filter      from '../../domain/model/filter';
import * as FilterSet   from '../../domain/model/filterSet';
import Cancellation     from '../../domain/errors/cancellation';
import KeyMapping       from '../../app/config/keys';

interface FilterableListOptions {
  keys: KeyMapping,
  parent: Widgets.Node,
  reports: Object,
  report: Object
}

export default class FilterableList extends List {

  protected options: FilterableListOptions;
  private keys: KeyMapping;
  private filters;
  private reports;
  private input;
  private metadata;

  constructor(options: FilterableListOptions) {
    super(options);

    this.keys = options.keys;

    sequencer(this, this.keys.leader, 100)
      .on(this.keys['filter.list'],     this.showFilters)
      .on(this.keys['filter.project'],  this.filter(this.metadata.getProjects, 'Project',  'project'))
      .on(this.keys['filter.assignee'], this.filter(this.metadata.getUsers,    'Assignee', 'assignee'))
      .on(this.keys['filter.type'],     this.filter(this.metadata.getTypes,    'Type',     'type'))
      .on(this.keys['filter.status'],   this.filter(this.metadata.getStatuses, 'Status',   'status'))
      .on(this.keys['filter.sprint'],   this.filter(f.prepend(this.metadata.getSprints,  'Active Sprints'), 'Sprint',   'sprint'))
      .on(this.keys['reports.save'],    this.reportsSave)
      .on(this.keys['reports.list'],    this.showReportsList);
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
