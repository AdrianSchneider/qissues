import { assert } from 'chai';
import * as circularArray from '../../../src/util/circularArray';

describe('Circular Arrays', () => {

  const data = [1, 2, 3, 4, 5];

  describe('#nextIndex', () => {
    it('Gets the next index when its within range', () => {
      assert.equal(circularArray.nextIndex(data, 0), 1);
    });

    it('Cycles back to zero once its out of range', () => {
      assert.equal(circularArray.nextIndex(data, 4), 0);
    });

    it('Can cycle through an array', () => {
      let index = 0;
      const expected = [1, 2, 3, 4, 0, 1];
      const captured = [];

      while (captured.length < expected.length) {
        index = circularArray.nextIndex(data, index);
        captured.push(index);
      }

      assert.deepEqual(captured, expected);
    });

  });

  describe('#prevIndex', () => {
    it('Gets the prev index when its within range', () => {
      assert.equal(circularArray.prevIndex(data, 2), 1);
    });

    it('Cycles back to the end when its out of range', () => {
      assert.equal(circularArray.prevIndex(data, 0), 4);
    });

    it('Can cycle backwards through an array', () => {
      let index = 0;
      const expected = [4, 3, 2, 1, 0, 4];
      const captured = [];

      while (captured.length < expected.length) {
        index = circularArray.prevIndex(data, index);
        captured.push(index);
      }

      assert.deepEqual(captured, expected);
    });
  });

});
