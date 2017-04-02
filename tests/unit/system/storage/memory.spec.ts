import { assert }    from 'chai';
import MemoryStorage from '../../../../src/system/storage/memory';

describe('Memory Storage', () => {

  var storage: MemoryStorage;
  beforeEach(() => storage = new MemoryStorage());

  it('Can be instantiated with predefined data', async () => {
    storage = new MemoryStorage({ a: 5 });
    assert.equal(await storage.get('a'), 5);
  });

  describe('Get/Set data', () => {

    it('Can set then get a key', async () => {
      await storage.set('name', 'adrian');
      assert.equal(await storage.get('name'), 'adrian');
    });

    it('Can return a fallback value when no key is set', async () => {
      assert.equal(await storage.get('made up key', 'foo'), 'foo');
    });

    it('Wont return the fallback when the returned value is falsey', async () => {
      await storage.set('balance', 0);
      assert.equal(await storage.get('balance', 100000), 0);
    });

    it('Setting data to null or undefined removes it');

  });

  describe('Removing', () => {

    beforeEach(async () => {
      await Promise.all([
        await storage.set('a', 1),
        await storage.set('b', 2)
      ]);
    });

    it('Can remove a key', async () => {
      await storage.remove('a');
      assert.deepEqual(await storage.keys(), ['b']);
    });

    it('Removing a non-existent does nothing', async () => {
      try {
        await storage.remove('asdflasdkjf');
        throw new Error('wat');
      } catch (e) {
        assert.equal(e.message, 'wat');
      }
    });

    it('Can remove multiple keys at once', async () => {
      await storage.removeMulti(['a', 'b']);
      assert.deepEqual(await storage.keys(), []);
    });

  });

  describe('Cleanup', () => {});

  describe('Serialization', () => {

    beforeEach(async () => {
      await Promise.all([
        await storage.set('a', 1),
        await storage.set('b', 2)
      ]);
    });

    it('Returns the current data', async () => {
      assert.deepEqual(await storage.serialize(), { a: 1, b: 2 });
    });

    it('Returned data is a clone and will not mutate current storage', async () => {
      const serialized = await storage.serialize();
      serialized['a']++;
      assert.equal(await storage.get('a'), 1);
    });

  });

});
