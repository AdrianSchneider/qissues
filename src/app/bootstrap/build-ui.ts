import * as blessed               from 'blessed';
import jsYaml                     from 'js-yaml';
import Container                  from '../services/container';
import BootstrapParams            from '../config/bootstrap';
import BlessedApplication         from '../../ui/app';
import keys                       from '../../ui/keys';
import Browser                    from '../../ui/browser';
import UserInput                  from '../../ui/input';
import * as clipboard             from '../../ui/clipboard';
import YamlFrontMatterFormat      from '../../ui/formats/yaml-front-matter';
import * as YamlFrontMatterParser from '../../util/frontmatter-yaml';

export default function buildUi(container: Container, config: BootstrapParams): Container {
  container.registerService(
    'util.yaml-frontmatter',
    () => new YamlFrontMatterParser(jsYaml)
  );

  container.registerService(
    'ui.formats.yaml-frontmatter',
    yamlFrontMatter => new YamlFrontMatterFormat(yamlFrontMatter, jsYaml),
    ['util.yaml-frontmatter']
  );

  container.registerService(
    'ui.keys',
    config => keys(config),
    ['config']
  );

  container.registerService(
    'ui.browser',
    config => new Browser(process, config.get('browser', null)),
    ['config']
  );

  container.registerService(
    'ui.clipboard',
    () => clipboard
  );

  container.registerService(
    'ui.input',
    (screen, keys, logger) => new UserInput(screen, keys, logger),
    ['ui.screen', 'ui.keys', 'logger']
  );

  container.registerService(
    'ui.screen',
    () => blessed.screen({ input: config.input, output: config.output })
  );

  container.registerService(
    'ui',
    (screen, app, tracker, config, input, logger, format, keys) => {
      return new BlessedApplication(
        screen,
        app,
        {},
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
