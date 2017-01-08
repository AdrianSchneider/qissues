import Container        from '../services/container';
import UiControllers    from '../../ui/controllers';
import IssuesController from '../../ui/controllers/issues';
import HelpController   from '../../ui/controllers/help';
import BootstrapParams  from './../config/bootstrap';

export default function(container: Container, config: BootstrapParams): Container {
  container.registerService(
    'ui.controller.issues',
    (app, ui, views, keys, tracker, browser, logger) => new IssuesController(
      app,
      ui,
      views,
      keys,
      tracker,
      browser,
      logger
    ),
    ['app', 'ui.interface', 'ui.views', 'ui.keys', 'tracker', 'ui.browser', 'logger']
  );

  container.registerService(
    'ui.controller.help',
    (screen) => new HelpController('less', ['-c'], 'docs/help.txt', screen),
    ['ui.screen']
  );

  container.registerService(
    'ui.controllers',
    (issuesController, helpController): UiControllers => ({
      issues: issuesController,
      help: helpController
    }),
    ['ui.controller.issues', 'ui.controller.help']
  );

  return container;
}
