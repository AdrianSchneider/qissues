import { assert } from 'chai';
import Id from '../../../../src/domain/model/id';
import { ChangeSet, ChangeSetBuilder } from '../../../../src/domain/model/changeSet';

describe('ChangeSet', function() {

  describe('#constructor', () => {

    it('Throws an error when no issues are changing', () => {
      assert.throws(() => new ChangeSet([], { a: 1 }), Error, 'at least');
    });

    it('Throws an error when multiple properties are changing', () => {
      assert.throws( () => new ChangeSet([new Id('1')], { a: 1, b: 2 }), Error, 'multiple');
    });

  });

});

describe('ChangeSetBuilder', () => {

  it('Can build a ChangeSet interactively', () => {
    const builder = new ChangeSetBuilder();
    const changes = builder
      .addIssue(new Id('1'))
      .addIssue(new Id('2'))
      .addChange('a', 5)
      .get();

    assert.deepEqual(changes.issues.map(String), ['1', '2']);
    assert.deepEqual(changes.changes, { a: 5 });
  });

});
