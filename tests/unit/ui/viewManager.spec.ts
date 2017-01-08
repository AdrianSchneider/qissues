import ViewManager      from '../../../src/ui/viewManager';
import Application      from '../../../src/app/main';
import BlessedInterface from '../../../src/ui/interface';
import KeyMapping       from '../../../src/app/config/keys';

describe('View Manager', () => {

  var app: Application;
  var ui: BlessedInterface;
  var keys: KeyMapping;
  var vm: ViewManager;
  beforeEach(() => {
    app = <Application>{};
    ui = <BlessedInterface>{};
    keys = <KeyMapping>{};
    vm = new ViewManager(app, ui, keys);
  });

  it('Loads', () => {

  });

});
