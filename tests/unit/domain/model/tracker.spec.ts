import { assert }   from 'chai';
import IssueTracker from '../../../../src/domain/model/tracker';
import Expectations from '../../../../src/domain/model/expectations';

describe('IssueTracker', () => {
  describe('#assertConfigured', () => {
    it('Rejects when more information is required');
    it('Fulfills when all information is present');
  });
});
