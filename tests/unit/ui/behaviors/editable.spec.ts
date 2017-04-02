import { assert }       from 'chai';
import { EventEmitter } from 'events';
import Editable         from "../../../../src/ui/behaviors/editable";
import Sequencer        from "../../../../src/ui/services/sequencer";
import BlessedInterface from "../../../../src/ui/interface";
import HasIssues        from "../../../../src/ui/views/hasIssues";
import TrackerMetadata  from "../../../../src/domain/model/trackerMetadata";
import Id               from "../../../../src/domain/model/id";
import Issue            from "../../../../src/domain/model/issue";
import User             from "../../../../src/domain/model/meta/user";
import Status           from "../../../../src/domain/model/meta/status";
import Sprint           from "../../../../src/domain/model/meta/sprint";
import IssuesCollection from "../../../../src/domain/model/issues";
import { ChangeSet }    from "../../../../src/domain/model/changeSet";
import Cancellation from "../../../../src/domain/errors/cancellation";

describe('Editable Behaviour', () => {

  var ui: BlessedInterface;
  var sequencer: Sequencer;
  var metadata: TrackerMetadata;
  var editable: Editable;
  var view: HasIssues;
  var actions: Object = {};
  var config = { keys: {
    changeTitle: 't',
    changeAssignee: 'a',
    changeStatus: 's',
    changeSprint: 'S'
  }};

  beforeEach(() => {
    ui = <BlessedInterface>{};
    sequencer = <Sequencer>{};
    metadata = <TrackerMetadata>{};
    view = <HasIssues>new EventEmitter();

    sequencer.on = (view, key, f) => {
      actions[key] = f;
      return sequencer;
    };

    editable = new Editable(ui, sequencer, metadata);
    editable.attach(view, config);
  });

  it('Emits ChangeSets for title changes', done => {
    ui.ask = message => Promise.resolve('answer');
    view.getIssues = () => new IssuesCollection([<Issue>{ id: new Id('1') }]);

    view.on('changeset', changeset => {
      assert.instanceOf(changeset, ChangeSet);
      assert.deepEqual(changeset.issues, [new Id('1')]);
      assert.deepEqual(changeset.changes, { title: 'answer' });
      done();
    });

    actions[config.keys.changeTitle]();
  });

  it('Emits ChangeSets for assignee changes', done => {
    ui.selectFromCallableList = (message, getOpts) => getOpts().then(results => {
      assert.equal(results[0], 'Unassigned');
      return results[1];
    });

    metadata.getUsers = () => Promise.resolve([new User('bob')]);
    view.getIssues = () => new IssuesCollection([<Issue>{ id: new Id('1') }]);

    view.on('changeset', changeset => {
      assert.instanceOf(changeset, ChangeSet);
      assert.deepEqual(changeset.issues, [new Id('1')]);
      assert.deepEqual(changeset.changes, { assignee: 'bob' });
      done();
    });

    actions[config.keys.changeAssignee]();
  });

  it('Emits ChangeSets for status changes', done => {
    ui.selectFromCallableList = (message, getOpts) => getOpts().then(results => results[0]);

    metadata.getStatuses = () => Promise.resolve([new Status('to do')]);
    view.getIssues = () => new IssuesCollection([<Issue>{ id: new Id('1') }]);

    view.on('changeset', changeset => {
      assert.instanceOf(changeset, ChangeSet);
      assert.deepEqual(changeset.issues, [new Id('1')]);
      assert.deepEqual(changeset.changes, { status: 'to do' });
      done();
    });

    actions[config.keys.changeStatus]();
  });

  it('Emits ChangeSets for sprint changes', done => {
    ui.selectFromCallableList = (message, getOpts) => getOpts().then(results => {
      assert.equal(results[0], 'Backlog');
      return results[1];
    });

    metadata.getSprints = () => Promise.resolve([new Sprint('1', 'urgent')]);
    view.getIssues = () => new IssuesCollection([<Issue>{ id: new Id('1') }]);

    view.on('changeset', changeset => {
      assert.instanceOf(changeset, ChangeSet);
      assert.deepEqual(changeset.issues, [new Id('1')]);
      assert.deepEqual(changeset.changes, { sprint: 'urgent' });
      done();
    });

    actions[config.keys.changeSprint]();
  });

  it('Cannot re-attach to another view', () => {
    assert.throws(() => editable.attach(view, config), Error, 'already');
  });

  it('Handles cancellations gracefully for text changes', async () => {
    ui.ask = message => { throw new Cancellation(); };
    view.on('changeset', changeset => { throw new Error('should cancel instead'); });
    actions[config.keys.changeTitle]();
  });

  it('Handles cancellations gracefully for list changes', () => {
    ui.selectFromCallableList = (message, getOpts) => {
      throw new Cancellation();
    };

    metadata.getSprints = () => Promise.resolve([new Sprint('1', 'urgent')]);
    view.on('changeset', changeset => { throw new Error('should cancel instead'); });
    actions[config.keys.changeSprint]();
  });

});
