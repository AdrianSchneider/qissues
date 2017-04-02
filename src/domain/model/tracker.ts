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
  public async assertConfigured(config: Object): Promise<void> {
    try {
      await this.expectations.ensureValid(config);
    } catch (e) {
      if (e instanceof ValidationError) {
        throw new MoreInfoRequired(e.message, this.expectations);
      }

      throw e;
    }
  }
}
