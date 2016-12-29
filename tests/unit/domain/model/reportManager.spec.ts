import { assert }    from 'chai';
import Storage       from '../../../../src/app/services/storage';
import ReportManager from '../../../../src/domain/model/reportManager';

describe('Report Manager', () => {

  var storage: Storage;
  beforeEach(() => {
    storage = {
      get: str => null,
      set: (key: string, value: any) => null,
      remove: (key) => null,
      removeMulti: (keys: string[]) => null,
      keys: (): string[] => ([]),
      serialize: (): Object => ({})
    };
  });

  describe('construction', () => {
    it('Sets the reports');
    it('Sets up a change handler to persist changes in storage');
  });

  describe('#get', () => {
    it('Can get a report by its name');
    it('Returns null when not found');
  });

  describe('#addReport', () => {
    it('Can add new reports and update storage');
    it('Can update existing reports and update storage');
  });

  describe('#serialize', () => {
    it('Returns an array of serialized reports');
  });

  describe('#unserialize', () => {
    it('Converts serialized reports into Reports');
  });

  describe('#getDefault', () => {
    it('Gets the default report');
    it('Creates and returns a new default report if none are defined yet');
  });

});
