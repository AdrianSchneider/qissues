import { assert }       from 'chai';
import { EventEmitter } from 'events';
import * as Promise     from 'bluebird';
import Yankable         from '../../../../src/ui/behaviors/yankable';
import Sequencer        from "../../../../src/ui/services/sequencer";
import Clipboard        from "../../../../src/ui/services/clipboard";
import HasIssues        from "../../../../src/ui/views/hasIssues";
import Id               from "../../../../src/domain/model/id";
import Issue            from "../../../../src/domain/model/issue";
import IssuesCollection from "../../../../src/domain/model/issues";

describe('Yankable Behaviour', () => {

  var yankable: Yankable;
  var clipboard: Clipboard;
  var sequencer: Sequencer;
  var config = { keys: {
    yankId: 'yi',
    yankTitle: 'yt',
    yankDescription: 'yd'
  }};
  var view: HasIssues;
  var actions: Object = {};

  beforeEach(() => {
    clipboard = <Clipboard>{};
    sequencer = <Sequencer>{};
    view = <HasIssues>new EventEmitter();

    sequencer.on = (view, key, f) => {
      actions[key] = f;
      return sequencer;
    };

    yankable = new Yankable(clipboard, sequencer);
    yankable.attach(view, config);
  });

  it('Cank yank id', done => {
    view.on('yanked', done);
    view.getIssues = () => new IssuesCollection([<Issue>{ id: new Id('55') }]);
    clipboard.copy = copied => Promise.resolve(assert.equal(copied, '55'));
    actions[config.keys.yankId]();
  });

  it('Cank yank title', done => {
    view.on('yanked', done);
    view.getIssues = () => new IssuesCollection([<Issue>{ title: 'hello world' }]);
    clipboard.copy = copied => Promise.resolve(assert.equal(copied, 'hello world'));
    actions[config.keys.yankTitle]();
  });

  it('Cank yank description', done => {
    view.on('yanked', done);
    view.getIssues = () => new IssuesCollection([<Issue>{ description: 'blah blah blah' }]);
    clipboard.copy = copied => Promise.resolve(assert.equal(copied, 'blah blah blah'));
    actions[config.keys.yankDescription]();
  });

  it('Yanks one value per line if multiple are selected', done => {
    view.on('yanked', done);
    view.getIssues = () => new IssuesCollection([
      <Issue>{ title: 'uploads are broken' },
      <Issue>{ title: 'uploads are really slow' },
    ]);
    clipboard.copy = copied => {
      assert.equal(copied, 'uploads are broken\nuploads are really slow');
      return Promise.resolve();
    };
    actions[config.keys.yankTitle]();
  });

  it('Does not yank if no issues are selected', () => {
    view.getIssues = () => new IssuesCollection([]);
    clipboard.copy = copied => { throw new Error('should not hit clipboard'); };
    actions[config.keys.yankId]();
  });

  it('Cannot attach to another view', () => {
    assert.throws(() => yankable.attach(view, config), Error, 'already');
  });

});
