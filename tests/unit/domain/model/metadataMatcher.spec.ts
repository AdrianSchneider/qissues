import { assert }      from 'chai';
import Metadata        from '../../../../src/domain/model/trackerMetadata';
import MetadataMatcher from '../../../../src/domain/model/metadataMatcher';

describe('Metadata Matcher', () => {

  var metadata: Metadata;
  var matcher: MetadataMatcher;
  beforeEach(() => {
    metadata = <Metadata>{};
    matcher = new MetadataMatcher(metadata);
  });

  describe('#matching', () => {
    it('Is case insensitive');
    it('Throws an error when results are ambiguous');
  });

  describe('#matchProject', () => {
    it('Matches partial accounts');
    it('Matches partial names');
  });

});
