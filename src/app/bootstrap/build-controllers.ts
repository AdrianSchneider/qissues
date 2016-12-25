import Container from '../services/container';

export default function(container: Container, config: Object): Container {
  container.registerService(
    'ui.controller',
    function(listIssues, createIssue, viewIssue, applyChangeSet, help) {
      return {
        listIssues: listIssues,
        createIssue: createIssue,
        viewIssue: viewIssue,
        applyChangeSet: applyChangeSet,
        help: help
      };
    },
    [
      'ui.controller.listIssues',
      'ui.controller.createIssue',
      'ui.controller.viewIssue',
      'ui.controller.applyChangeSet',
      'ui.controller.help'
    ]
  );

  container.registerService(
    'ui.controller.listIssues',
    function(app, ui, input, keys, tracker, browser) {
      return listIssuesController(app, ui, input, keys, tracker, browser);
    },
    ['app', 'ui', 'ui.input', 'ui.keys', 'tracker', 'ui.browser']
  );

  container.registerService(
    'ui.controller.viewIssue',
    function(app, ui, input, keys, tracker, logger, browser) {
      return viewIssueController(app, ui, input, keys, tracker, logger, browser);
    },
    ['app', 'ui', 'ui.input', 'ui.keys', 'tracker', 'logger', 'ui.browser']
  );

  container.registerService(
    'ui.controller.createIssue',
    function(ui, tracker, logger) { return createIssueController(ui, tracker, logger); },
    ['ui', 'tracker', 'logger']
  );

  container.registerService(
    'ui.controller.applyChangeSet',
    function(ui, tracker) { return applyChangeSetController(ui, tracker); },
    ['ui', 'tracker']
  );

  container.registerService(
    'ui.controller.help',
    function() { return helpController('less', ['-c'], 'docs/help.txt'); }
  );

  return container;
}
