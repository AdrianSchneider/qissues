import { assert } from 'chai';
import Id from '../../../../src/domain/model/id';

describe('Id', () => {

  it('Can instantiate from Id', () => {
    assert.deepEqual(new Id(new Id(100)).toString(), '100');
  });

  it('Can instantiate from Number', () => {
    assert.deepEqual(new Id(100).toString(), '100');
  });

  it('Can instantiate from String', () => {
    assert.deepEqual(new Id('100').toString(), '100');
  });

});
