import { assert } from 'chai';
import Browser    from '../../../../src/ui/services/browser';

describe('UI Browser', () => {

  it('Spawns the preferred program when configured', done => {
    const browser = new Browser({}, 'peanuts', (cmd, args) => {
      assert.equal(cmd, 'peanuts');
      assert.deepEqual(args, ['www.site.com']);
      return done();
    });

    browser.open('www.site.com');
  });

  it('Spawns `open` when on a darwin system', done => {
    const browser = new Browser({ platform: 'darwin' }, null, (cmd, args) => {
      assert.equal(cmd, 'open');
      assert.deepEqual(args, ['www.site.com']);
      return done();
    });

    browser.open('www.site.com');
  });

  it('Spawns `xdg-open` when on a linux system', done => {
    const browser = new Browser({ platform: 'linux' }, null, (cmd, args) => {
      assert.equal(cmd, 'xdg-open');
      assert.deepEqual(args, ['www.site.com']);
      return done();
    });

    browser.open('www.site.com');
  });

  it('Throws an error when unable to detect the browser', () => {
    const browser = new Browser({ platform: '????' }, null, (cmd, args) => {});
    assert.throws(
      () => browser.open('www.site.com'),
      Error,
      'Could not detect'
    );
  });

});
