import * as Promise      from 'bluebird';
import TrackerNormalizer from './trackerNormalizer';
import TrackerRepository from './trackerRepository';
import TrackerMetadata   from './trackerMetadata';
import Expectations      from './expectations';
import ValidationError   from '../errors/validation';
import MoreInfoRequired  from '../errors/infoRequired';

/**
 * A single point of access for an issue tracker
 */
export default class IssueTracker {
  public normalizer: TrackerNormalizer;
  public repository: TrackerRepository;
  public metadata: TrackerMetadata;
  public expectations: Expectations;

  constructor(normalizer: TrackerNormalizer, repository: TrackerRepository, metadata: TrackerMetadata, expectations: Expectations) {
    this.normalizer = normalizer;
    this.repository = repository;
    this.metadata = metadata;
    this.expectations = expectations;
  }

  /**
   * Ensures that the issue tracker has the required configuration it needs
   */
  public assertConfigured(config: Object): Promise<void> {
    return this.expectations.ensureValid(config)
      .catch(e => e instanceof ValidationError, err => {
        throw new MoreInfoRequired(err.message, this.expectations);
      });
  }
}
