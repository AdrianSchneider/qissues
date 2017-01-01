import { assert }    from 'chai';
import MemoryStorage from '../../../../../src/app/services/storage/memory';

describe('Memory Storage', () => {

  var storage: MemoryStorage;
  beforeEach(() => storage = new MemoryStorage());

  it('Can be instantiated with predefined data', () => {
    storage = new MemoryStorage({ a: 5 });
    assert.equal(storage.get('a'), 5);
  });

  describe('Get/Set data', () => {

    it('Can set then get a key', () => {
      storage.set('name', 'adrian');
      assert.equal(storage.get('name'), 'adrian');
    });

    it('Can return a fallback value when no key is set', () => {
      assert.equal(storage.get('made up key', 'foo'), 'foo');
    });

    it('Wont return the fallback when the returned value is falsey', () => {
      storage.set('balance', 0);
      assert.equal(storage.get('balance', 100000), 0);
    });

    it('Setting data to null or undefined removes it');

  });

  describe('Removing', () => {

    beforeEach(() => {
      storage.set('a', 1);
      storage.set('b', 2);
    });

    it('Can remove a key', () => {
      storage.remove('a');
      assert.deepEqual(storage.keys(), ['b']);
    });

    it('Removing a non-existent does nothing', () => {
      assert.doesNotThrow(() => storage.remove('asdflasdkjf'));
    });

    it('Can remove multiple keys at once', () => {
      storage.removeMulti(['a', 'b']);
      assert.deepEqual(storage.keys(), []);
    });

  });

  describe('Cleanup', () => {});

  describe('Serialization', () => {

    beforeEach(() => {
      storage.set('a', 1);
      storage.set('b', 2);
    });

    it('Returns the current data', () => {
      assert.deepEqual(storage.serialize(), { a: 1, b: 2 });
    });

    it('Returned data is a clone and will not mutate current storage', () => {
      const serialized = storage.serialize();
      serialized['a']++;
      assert.equal(storage.get('a'), 1);
    });

  });

});
