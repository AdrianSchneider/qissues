import { assert, expect } from 'chai';
import HealthCheck from '../../../src/app/healthCheck';

describe('health Check', () => {

  let checker: HealthCheck;
  beforeEach(() => {
    checker = new HealthCheck();
  });

  it('Successful health check returns 5', () => {
    return checker.success().then(result => {
      assert.equal(result, 5);
    });
  });

  it('Failed health check throws an error', () => {
     return checker.fail()
  });

  it.only('Failed health check throws an error - await', async () => {
    throw new Error('whoops');
  });




});
