import TrackerNormalizer from './trackerNormalizer';
import TrackerRepository from './trackerRepository';
import TrackerMetadata   from './trackerMetadata';
import Expectations      from './expectations';
import ValidationError   from '../errors/validation';
import MoreInfoRequired  from '../errors/infoRequired';

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

  public assertConfigured(config: Object) {
    return this.expectations.ensureValid(config)
      .catch(ValidationError, err => {
        throw new MoreInfoRequired(err.message, this.expectations);
      });
  }
}
