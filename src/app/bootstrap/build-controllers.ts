import Container        from '../services/container';
import IssuesController from '../../ui/controllers/issues';
import HelpController   from '../../ui/controllers/help';

export default function(container: Container, config: Object): Container {
  container.registerService(
    'ui.controller.issues',
    (app, ui, input, keys, tracker, browser, logger) => new IssuesController(
      app,
      ui,
      input,
      keys,
      tracker,
      browser,
      logger
    ),
    ['app', 'ui', 'ui.input', 'ui.keys', 'tracker', 'ui.browser', 'logger']
  );

  container.registerService(
    'ui.controller.help',
    (screen) => new HelpController('less', ['-c'], 'docs/help.txt', screen),
    ['ui.screen']
  );

  return container;
}
