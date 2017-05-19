import * as blessed         from 'blessed'
import Behaviour            from '../behaviour';
import BlessedInterface     from '../interface';
import Sequencer            from '../services/sequencer';
import HasIssues            from '../views/hasIssues';
import { ChangeSetBuilder } from '../../domain/model/changeSet';
import TrackerMetadata      from '../../domain/model/trackerMetadata';
import Cancellation         from '../../domain/errors/cancellation';
import Filter               from '../../domain/model/filter';
import FilterSet            from '../../domain/model/filterSet';
import ReportManager        from '../../domain/model/reportManager';

interface FilterableOptions {
  keys: FilterableKeys,
  getFilters: () => FilterSet
}

interface FilterableKeys {
  filterList: string,
  filterProject: string,
  filterAssignee: string,
  filterStatus: string,
  filterSprint: string,
  filterType: string,
  reportsSave: string,
  reportsList: string
}

/**
 * Responsible for creating changesets for the selected issues
 */
export default class Filterable implements Behaviour {
  private view: HasIssues;
  private readonly sequencer: Sequencer;
  private readonly metadata: TrackerMetadata;
  private readonly ui: BlessedInterface;
  private filters: FilterSet;
  private reportManager: ReportManager;

  public readonly name: string = 'filterable';
  public readonly events: string[] = [];

  constructor(ui: BlessedInterface, sequencer: Sequencer, metadata: TrackerMetadata, reports: ReportManager) {
    this.ui = ui;
    this.sequencer = sequencer;
    this.metadata = metadata;
    this.reportManager = reports;
  }

  /**
   * Registers the yankable with the node
   */
  public attach(view: HasIssues, options: FilterableOptions): void {
    if (this.view) throw new Error('Filterable already has a view');
    this.filters = options.getFilters();

    this.view = view;
    this.sequencer
      .on(view.node, options.keys.reportsSave, this.saveReport())
      .on(view.node, options.keys.reportsList, this.listReports())
      .on(view.node, options.keys.filterList, this.listFilters())
      .on(view.node, options.keys.filterProject, this.filterFromSelection(
        (invalidate) => this.metadata.getProjects({ invalidate })
          .then(projects => projects.map(String)),
        'Project',
        'project'
      ))
      .on(view.node, options.keys.filterAssignee, this.filterFromSelection(
        (invalidate) => this.metadata.getUsers({ invalidate })
          .then(users => ['Unassigned'].concat(users.map(String))),
        'Assignee',
        'assignee'
      ))
      .on(view.node, options.keys.filterSprint, this.filterFromSelection(
        (invalidate) => this.metadata.getSprints({ invalidate })
          .then(sprints => ['Backlog'].concat(sprints.map(String))),
        'Sprint',
        'sprint'
      ))
      .on(view.node, options.keys.filterType, this.filterFromSelection(
        (invalidate) => this.metadata.getTypes({ invalidate })
          .then(types => types.map(String)),
        'Type',
        'type'
      ))
      .on(view.node, options.keys.filterStatus, this.filterFromSelection(
        (invalidate) => this.metadata.getStatuses({ invalidate })
          .then(users => users.map(String)),
        'Status',
        'status'
      ));
  }

  public serialize() {
    return {};
  }

  /**
   * Shows the manipulable list of filters
   */
  private listFilters(): () => Promise<string> {
    return async () => {
      const options = this.filters.map(filter => `${filter.type} = ${filter.value}`);
      try {
        return await this.ui.selectFromList('Filters', options);
      } catch (e) {
        if (e instanceof Cancellation) return;
        throw e;
      }
    };
  }

  /**
   * Resolves to the application of a filter chosen from a lazily
   * loaded list
   */
  private filterFromSelection(getOptions: (i) => Promise<string[]>, message: string, field: string) {
    return async () => {
      try {
        const selection = await this.ui.selectFromCallableList(message, getOptions);
        return this.filterBy(field, selection);
      } catch (e) {
        if (e instanceof Cancellation) return;
        throw e;
      }
    };
  }

  /**
   * Applies the filters
   */
  private filterBy(field: string, selection: string) {
    this.filters.add(new Filter(field, selection));
  }

  /**
   * Saves a new report
   */
  private saveReport(): () => Promise<any> {
    return async () => {
      try {
        const name = await this.ui.ask('Save Filters As');
        this.reportManager.saveAs(name);
      } catch (e) {
        if (e instanceof Cancellation) return;
        throw e;
      }
    }
  }

  /**
   * Lists all of the reports
   */
  private listReports() {
    return () => {
      try {
        return this.ui.selectFromList(
          'Reports',
          this.reportManager.serialize().map(row => row.name)
        );
      } catch (e) {
        if (e instanceof Cancellation) return;
        throw e;
      }
    }
  }

}
