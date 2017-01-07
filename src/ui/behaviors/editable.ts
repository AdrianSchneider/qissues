import * as Promise         from 'bluebird';
import * as blessed         from 'blessed'
import Behaviour            from '../behaviour';
import BlessedInterface     from '../interface';
import Sequencer            from '../services/sequencer';
import HasIssues            from '../views/hasIssues';
import { ChangeSetBuilder } from '../../domain/model/changeSet';
import TrackerMetadata      from '../../domain/model/trackerMetadata';
import Cancellation         from '../../domain/errors/cancellation';

interface EditableOptions {
  keys: EditableKeys
}

interface EditableKeys {
  changeTitle: string,
  changeAssignee: string,
  changeStatus: string,
  changeSprint: string
}

/**
 * Responsible for creating changesets for the selected issues
 */
export default class Editable implements Behaviour {
  private view: HasIssues;
  private readonly sequencer: Sequencer;
  private readonly metadata: TrackerMetadata;
  private readonly ui: BlessedInterface;

  public readonly events: string[] = [
    'changeset'
  ];

  constructor(ui: BlessedInterface, sequencer: Sequencer, metadata: TrackerMetadata) {
    this.ui = ui;
    this.sequencer = sequencer;
    this.metadata = metadata;
  }

  /**
   * Registers the yankable with the node
   */
  public attach(view: HasIssues, options: EditableOptions): void {
    if (this.view) throw new Error('Editable already has a view');

    this.view = view;
    this.sequencer
      .on(view.node, options.keys.changeTitle,    this.changeText('Title', 'title'))
      .on(view.node, options.keys.changeAssignee, this.changeList(
        () => this.metadata.getUsers()
          .then(users => ['Unassigned'].concat(users.map(String))),
        'Assignee',
        'assignee'
      ))
      .on(view.node, options.keys.changeStatus,   this.changeList(
        () => this.metadata.getStatuses()
          .then(statuses => statuses.map(String)),
        'Status',
        'status'
      ))
      .on(view.node, options.keys.changeSprint,   this.changeList(
        () => this.metadata.getSprints()
          .then(sprints => ['Backlog'].concat(sprints.map(String))),
        'Sprint',
        'sprint'
      ));
  }

  /**
   * Returns a function that will prompt the user, then emit a changeset
   */
  private changeText(message: string, field: string) {
    return () => this.ui.ask(message)
      .then(input => this.emitChanged(field, input))
      .catch(Cancellation, () => {});
  }

  /**
   * Returns a function that will prompt the user with a list, then emit a changeset
   */
  private changeList(getOptions: () => Promise<string[]>, message: string, field: string) {
    return () => this.ui.selectFromCallableList(message, getOptions)
      .then(selection => this.emitChanged(field, selection))
      .catch(Cancellation, () => {});
  }

  /**
   * Emits a changeset for the field that changed
   */
  private emitChanged(field: string, content: string) {
    this.view.emit(
      'changeset',
      (new ChangeSetBuilder())
        .addIssues(this.view.getIssues().map(issue => issue.id))
        .addChange(field, content)
        .get()
    );
  }
}
