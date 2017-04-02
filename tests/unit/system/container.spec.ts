'use strict';

import { assert }   from 'chai';
import Container    from '../../../src/system/container';

describe('Container', function() {

  var container: Container;
  beforeEach(function() {
    container = new Container();
  });

  it('Can set and get an asynchronous service', async () => {
    container.registerService('test', () => Promise.resolve(5));
    assert.equal(await container.get('test'), 5);
  });

  it('Cannot replace an existing service', () => {
    container.registerService('test', () => Promise.resolve(5));
    assert.throws(
      () => container.registerService('test', () => Promise.resolve(5)),
      Error,
      'existing'
    );
  });

  // XXX having issues
  it.skip('Cannot get an undefined service', async () => {
    await assert.throws(
      async () => await container.get('made up'),
      Error,
      'made up'
    );
  });

  it('Cannot get an undefined dependency (with more useful error)', () => {
    container.registerService('test', () => Promise.resolve(5), ['libc']);
    return container.get('test').catch(e => assert.include(e.message, 'for test'));
  });

  it('Dependencies are never loaded more than once', async () => {
    let ran = false;
    const getIt = () => new Promise((resolve, reject) => {
      if (ran) return reject(new Error('too expensive to repeat'));
      ran = true;
      return resolve(5);
    });

    container.registerService('test', getIt);
    await container.get('test');
    assert.equal(await container.get('test'), 5);
  });

  it('Can get multiple services at once', () => {
    container.registerService('a', () => Promise.resolve('a'));
    container.registerService('b', () => Promise.resolve('b'));
    container.registerService('c', () => Promise.resolve('c'));

    return container.getMatching(['a', 'b', 'c']).then(services => {
      var [a, b, c] = services;
      assert.deepEqual([a, b, c], ['a', 'b', 'c']);
    });
  });

  it('Can decorate services', () => {
    container.registerService('multiplier', () => (a, b) => a * b);
    container.registerBehaviour(
      'multipliable',
      (service, options, multiplier) => multiplier(service, options['by']),
      ['multiplier']
    );

    container.registerService('four', () => 4, [], <any>{ multipliable: { by: 2 } });
    return container.get('four').then(num => assert.equal(num, 8));
  });

  it('Cannot redefine decorators', () => {
    container.registerBehaviour('multipliable', () => null);
    assert.throws(
      () => container.registerBehaviour('multipliable', () => null),
      Error,
      'existing'
    );
  });

});
