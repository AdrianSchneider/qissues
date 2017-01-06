import { assert }       from 'chai';
import { EventEmitter } from 'events';
import Sequencer        from '../../../../src/ui/services/sequencer';

describe('Event Sequencer', () => {

  it('Leader starts recording mode and ignores registered keys', () => {
    const node = new EventEmitter();
    node.on('key a', () => { throw new Error('dont do this'); });

    const sequencer = new Sequencer();
    sequencer.on(node, 'ciw', () => {});

    node.emit('key ,');
    node.emit('key a');
  });

  it('Timed out recording reverts original key handlers', done => {
    const node = new EventEmitter();
    node.on('key a', done);

    const sequencer = new Sequencer(',', 1);
    sequencer.on(node, 'ciw', () => {});

    node.emit('key ,');
    setTimeout(() => node.emit('key a'), 1);
  });

  it('Calls the registered callback when sequence is entered', done => {
    const node = new EventEmitter();
    const sequencer = new Sequencer(',', 1);
    sequencer.on(node, 'ciw', done);

    node.emit('key ,');
    'ciw'.split('').forEach(key => node.emit(`keypress`, null, { sequence: key }));
  });

  it('Resumes normal key handling after successful sequence', done => {
    const node = new EventEmitter();
    node.on('key d', done);

    const sequencer = new Sequencer(',', 1);
    sequencer.on(node, 'ciw', () => {});

    node.emit('key ,');
    'ciw'.split('').forEach(key => node.emit(`keypress`, null, { sequence: key }));
    node.emit('key d');
  });

  it('Safe to record while recording', done => {
    const node = new EventEmitter();
    const sequencer = new Sequencer(',', 1);
    sequencer.on(node, 'ciw', done);
    node.emit('key ,');
    node.emit('key ,');
    node.emit('key ,');
    'ciw'.split('').forEach(key => node.emit(`keypress`, null, { sequence: key }));
  });

  it('Can unregister listeners', () => {
    const node = new EventEmitter();
    const sequencer = new Sequencer(',', 1);
    sequencer.on(node, 'ciw', () => { throw new Error('fail'); });
    sequencer.remove(node, 'ciw');
    node.emit('key ,');
    'ciw'.split('').forEach(key => node.emit(`keypress`, null, { sequence: key }));
  });

  it('Will re-render if the emitter contains a screen when recording stops', done => {
    // this is to simulate a blessed element
    const node = new EventEmitter();
    node['screen'] = { render: done };

    const sequencer = new Sequencer(',', 1);
    sequencer.on(node, 'ciw', () => {});

    node.emit('key ,');
  });

});
