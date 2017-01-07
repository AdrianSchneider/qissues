import BootstrapParams  from '../config/bootstrap';
import Container        from '../services/container';
import BlessedInterface from '../../ui/interface';
import Behaviour        from '../../ui/behaviour';
import Editable         from '../../ui/behaviors/editable';
import Yankable         from '../../ui/behaviors/yankable';
import IssueList        from '../../ui/views/issueList';
import Clipboard        from '../../ui/services/clipboard';
import Sequencer        from '../../ui/services/sequencer';
import IssueTracker     from '../../domain/model/tracker';

export default function(container: Container, config: BootstrapParams) {
  container.registerService(
    'ui.views',
    (issueList) => ({ issueList }),
    ['ui.views.issueList']
  );

  container.registerService(
    'ui.views.issueList',
    (keyConfig, ...behaviours: Behaviour[]) => {
      const view = new IssueList();
      //behaviours.forEach(behaviour => behaviour.attach(view, { keys: keyConfig }));
      return view;
    },
    ['ui.keys', 'ui.behaviours.editable', 'ui.behaviours.yankable']
  );

  container.registerService(
    'ui.behaviours.editable',
    (ui: BlessedInterface, sequencer: Sequencer, tracker: IssueTracker) => {
      return new Editable(ui, sequencer, tracker.metadata);
    },
    ['ui', 'ui.sequencer', 'tracker']
  );

  container.registerService(
    'ui.behaviours.yankable',
    (clipboard: Clipboard, sequencer: Sequencer) => new Yankable(clipboard, sequencer),
    ['ui.sequencer', 'ui.clipboard']
  );

  return container;
}
