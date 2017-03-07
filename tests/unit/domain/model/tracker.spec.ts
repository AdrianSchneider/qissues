import { assert }       from 'chai';
import IssueTracker     from '../../../../src/domain/model/tracker';
import Expectations     from '../../../../src/domain/model/expectations';
import ValidationError  from '../../../../src/domain/errors/validation';
import MoreInfoRequired from '../../../../src/domain/errors/infoRequired';

describe('IssueTracker', () => {

  var normalizer;
  var repository;
  var metadata;
  var expectations;
  var tracker: IssueTracker;

  beforeEach(() => {
    normalizer = {};
    repository = {};
    metadata = {};
    expectations = {};
    tracker = new IssueTracker(normalizer, repository, metadata, expectations);
  });

  describe('#assertConfigured', () => {

    it('Rejects when more information is required', () => {
      var config = { password: 'letmein' };

      expectations.ensureValid = c => {
        assert.deepEqual(c, config);
        return Promise.reject(new ValidationError('nope'));
      };

      return tracker.assertConfigured(config).catch(e => {
        assert.isTrue(e instanceof MoreInfoRequired);
      });
    });

    it('Fulfills when all information is present', () => {
      var config = { password: 'letmein' };

      expectations.ensureValid = c => {
        assert.deepEqual(c, config);
        return Promise.resolve();
      };

      return tracker.assertConfigured(config);
    });

  });
});
