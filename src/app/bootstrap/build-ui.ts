import * as blessed               from 'blessed';
import jsYaml                     from 'js-yaml';
import Container                  from '../services/container';
import BlessedApplication         from '../../ui/app';
import keys                       from '../../ui/keys';
import Browser                    from '../../ui/browser';
import UserInput                  from '../../ui/input';
import * as clipboard             from '../../ui/clipboard';
import YamlFrontMatterFormat      from '../../ui/formats/yaml-front-matter';
import * as YamlFrontMatterParser from '../../util/frontmatter-yaml';

export default function buildUi(container: Container, config: Object): Container {
  container.registerService(
    'util.yaml-frontmatter',
    function() { return new YamlFrontMatterParser(require('js-yaml')); }
  );

  container.registerService(
    'ui.formats.yaml-frontmatter',
    function(yamlFrontMatter) { return new YamlFrontMatterFormat(yamlFrontMatter, jsYaml); },
    ['util.yaml-frontmatter']
  );

  container.registerService(
    'ui.keys',
    function(config) { return keys(config); },
    ['config']
  );

  container.registerService(
    'ui.browser',
    function(config) { return new Browser(process, config.get('browser', null)); },
    ['config']
  );

  container.registerService(
    'ui.clipboard',
    function() { return clipboard; }
  );

  container.registerService(
    'ui.input',
    function(screen, keys, logger) {
      return new UserInput(screen, keys, logger);
    },
    ['ui.screen', 'ui.keys', 'logger']
  );

  container.registerService(
    'ui.screen',
    function() {
      // TODO pass in process
      return blessed.screen({ input: process.stdin, ouptut: process.stdout });
    }
  );

  container.registerService(
    'ui',
    function(screen, app, tracker, config, input, logger, format, keys) {
      return new BlessedApplication(
        screen,
        app,
        tracker,
        config,
        input,
        logger,
        format,
        keys,
        function() {
          return container.getMatching(['ui.controller', 'ui.views']);
        }
      );
    },
    ['ui.screen', 'app', 'tracker', 'config', 'ui.input', 'logger', 'ui.formats.yaml-frontmatter', 'ui.keys']
  );

  return container;
}
