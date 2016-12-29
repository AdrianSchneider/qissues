import { assert }       from 'chai';
import Id               from '../../../../src/domain/model/id';
import Issue            from '../../../../src/domain/model/issue';
import IssuesCollection from '../../../../src/domain/model/issues';
import Status           from '../../../../src/domain/model/meta/status';

describe('Issues Collection', () => {

  describe('Array compatibility', () => {
    const issue = new Issue(new Id(1), 'title', 'desc', new Status('wip'));

    it('.length', () => {
      assert.equal(new IssuesCollection([]).length, 0);
      assert.equal(new IssuesCollection([issue]).length, 1);
    });

    it('.map', () => {
      assert.deepEqual(
        new IssuesCollection([issue]).map(i => i.title),
        ['title']
      );
    });

    it('.filter', () => {
      const filtered = new IssuesCollection([issue]).filter(i => i.title !== 'title');
      assert.equal(filtered.length, 0);
    });

  });

});
