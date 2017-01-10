import { Widgets }    from 'blessed';
import { assert }     from 'chai';
import HelpController from '../../../../src/ui/controllers/help';

describe('Help Controller', () => {

  var screen: Widgets.Screen;
  beforeEach(() => {
    screen = <Widgets.Screen>{};
  });

  it('Runs the help command and re-renders', done => {
    screen.exec = (program, args, options, cb): any => {
      assert.equal(program, 'vimcat');
      assert.deepEqual(args, ['--fancy', 'docs.html']);
    };
    screen.render = done;

    const controller = new HelpController('vimcat', ['--fancy'], 'docs.html', screen);
    controller.help();
  });

});
