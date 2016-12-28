'use strict';

import { expect }   from 'chai';
import * as Promise from 'bluebird';
import Container    from '../../../../src/app/services/container';

describe('Container', function() {

  var container: Container;

  beforeEach(function() {
    container = new Container();
  });

  it.only('Can set and get an asynchronous service', function() {
    container.registerService('test', () => Promise.resolve(5));
    return container.get('test').then(value => expect(value).to.equal(5));
  });

});
