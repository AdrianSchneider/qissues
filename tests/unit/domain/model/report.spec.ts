import { assert } from 'chai';
import Report from '../../../../src/domain/model/report';
import Filter from '../../../../src/domain/model/filter';
import FilterSet from '../../../../src/domain/model/filterSet';

describe('Report', () => {

  describe('constructor', () => {

    it('Clones the filters', () => {
      const filters = new FilterSet([]);
      const report = new Report('name', filters);
      filters.add(new Filter('key', 'value'));
      assert.lengthOf(report.filters.serialize(), 0);
    });

    it('Starts emitting change events for the filters', done => {
      const report = new Report('name', new FilterSet([]));
      report.on('change', done);
      report.filters.add(new Filter('key', 'value'));
    });
  });

  describe('#replaceFilters', () => {
    it('Clones the filters and emits a change event');
  });

  describe('#serialize', () => {
    it('Returns the name and cloned filters');
  });

  describe('Serialization', () => {
    it('Can be serialized and unserialized');
  });

});
