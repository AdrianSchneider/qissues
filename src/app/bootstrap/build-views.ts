import BootstrapParams    from '../config/bootstrap';
import Container          from '../services/container';
import BlessedInterface   from '../../ui/interface';
import Behaviour          from '../../ui/behaviour';
import Editable           from '../../ui/behaviors/editable';
import Yankable           from '../../ui/behaviors/yankable';
import ExternallyViewable from '../../ui/behaviors/externallyViewable';
import Searchable         from '../../ui/behaviors/searchable';
import IssueList          from '../../ui/views/issueList';
import SingleIssue        from '../../ui/views/single';
import ViewManager        from '../../ui/viewManager';
import Clipboard          from '../../ui/services/clipboard';
import Sequencer          from '../../ui/services/sequencer';
import Browser            from '../../ui/services/browser';
import IssueTracker       from '../../domain/model/tracker';

export default function(container: Container, config: BootstrapParams) {
  container.registerService(
    'ui.view-manager',
    (app, ui, keyConfig, ...behaviours) => {
      const viewManager = new ViewManager(app, ui, keyConfig);
      viewManager.registerView('issues:view', SingleIssue, behaviours);
      viewManager.registerView('issues:list', IssueList, behaviours);
      return viewManager;
    },
    ['app', 'ui', 'ui.keys',
      'ui.behaviours.editable',
      'ui.behaviours.yankable',
      'ui.behaviours.externally-viewable',
      'ui.behaviours.searchable'
    ]
  );

  container.registerService(
    'ui.behaviours.editable',
    (ui: BlessedInterface, sequencer: Sequencer, tracker: IssueTracker) => () => {
      return new Editable(ui, sequencer, tracker.metadata);
    },
    ['ui', 'ui.sequencer', 'tracker']
  );

  container.registerService(
    'ui.behaviours.yankable',
    (clipboard: Clipboard, sequencer: Sequencer) => () => new Yankable(clipboard, sequencer),
    ['ui.clipboard', 'ui.sequencer']
  );

  container.registerService(
    'ui.behaviours.externally-viewable',
    (browser: Browser, tracker: IssueTracker) => () => {
      return new ExternallyViewable(browser, tracker.normalizer);
    },
    ['ui.browser', 'tracker']
  );

  container.registerService(
    'ui.behaviours.searchable',
    (ui, logger) => () => new Searchable(ui, logger),
    ['ui.interface', 'logger']
  );

  return container;
}
