import BootstrapParams  from '../config/bootstrap';
import Container        from '../services/container';
import BlessedInterface from '../../ui/interface';
import Behaviour        from '../../ui/behaviour';
import Editable         from '../../ui/behaviors/editable';
import Yankable         from '../../ui/behaviors/yankable';
import IssueList        from '../../ui/views/issueList';
import SingleIssue      from '../../ui/views/single';
import Clipboard        from '../../ui/services/clipboard';
import Sequencer        from '../../ui/services/sequencer';
import IssueTracker     from '../../domain/model/tracker';

export default function(container: Container, config: BootstrapParams) {
  container.registerService(
    'ui.views',
    (issueList, singleIssue) => ({ issueList, singleIssue }),
    ['ui.views.issueList', 'ui.views.singleIssue']
  );

  container.registerService(
    'ui.views.issueList',
    (app, ui, keyConfig, ...behaviours: Behaviour[]) => {
      const view = new IssueList(app, ui, keyConfig);
      // TODO race condition here; render vs instntiation refactoring needed
      //behaviours.forEach(behaviour => behaviour.attach(view, { keys: keyConfig }));
      return view;
    },
    ['app', 'ui', 'ui.keys', 'ui.behaviours.editable', 'ui.behaviours.yankable']
  );

  container.registerService(
    'ui.views.singleIssue',
    (app, ui, keyConfig, ...behaviours: Behaviour[]) => {
      const view = new SingleIssue(app, ui, keyConfig);
      // TODO race condition here; render vs instntiation refactoring needed
      //behaviours.forEach(behaviour => behaviour.attach(view, { keys: keyConfig }));
      return view;
    },
    ['app', 'ui', 'ui.keys', 'ui.behaviours.editable', 'ui.behaviours.yankable']
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
