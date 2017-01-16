import * as Promise         from 'bluebird';
import * as blessed         from 'blessed'
import Behaviour            from '../behaviour';
import BlessedInterface     from '../interface';
import Sequencer            from '../services/sequencer';
import HasIssues            from '../views/hasIssues';
import { ChangeSetBuilder } from '../../domain/model/changeSet';
import TrackerMetadata      from '../../domain/model/trackerMetadata';
import Cancellation         from '../../domain/errors/cancellation';

interface FilterableOptions {
  keys: FilterableKeys
}

interface FilterableKeys {
  filterList: string,
  filterAssignee: string
}

/**
 * Responsible for creating changesets for the selected issues
 */
export default class Filterable implements Behaviour {
  private view: HasIssues;
  private readonly sequencer: Sequencer;
  private readonly metadata: TrackerMetadata;
  private readonly ui: BlessedInterface;

  public readonly events: string[] = [];

  constructor(ui: BlessedInterface, sequencer: Sequencer, metadata: TrackerMetadata) {
    this.ui = ui;
    this.sequencer = sequencer;
    this.metadata = metadata;
  }

  /**
   * Registers the yankable with the node
   */
  public attach(view: HasIssues, options: FilterableOptions): void {
    if (this.view) throw new Error('Filterable already has a view');

    this.view = view;
    this.sequencer
      .on(view.node, options.keys.filterList, this.listFilters())
      .on(view.node, options.keys.filterAssignee, this.filterFromSelection(
        (invalidate) => this.metadata.getUsers({ invalidate })
          .then(users => ['Unassigned'].concat(users.map(String))),
        'Assignee',
        'assignee'
      ));
  }

  private listFilters() {
    return () => {
      console.error('listFilters()');
    };
  }

  private filterFromSelection(getOptions: (i) => Promise<string[]>, message: string, field: string) {
    return () => this.ui.selectFromCallableList(message, getOptions)
      .then(selection => this.emitChanged(field, selection))
      .catch(Cancellation, () => {});
  }

  private emitChanged(field: string, selection: string) {
    console.error(`Selected ${field} = ${selection}`);
  }

}
