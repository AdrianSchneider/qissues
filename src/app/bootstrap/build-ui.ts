import * as blessed          from 'blessed';
import jsYaml                from 'js-yaml';
import Container             from '../services/container';
import BootstrapParams       from '../config/bootstrap';
import BlessedApplication    from '../../ui/app';
import BlessedInterface      from '../../ui/interface';
import keys                  from '../../ui/keys';
import Browser               from '../../ui/browser';
import * as clipboard        from '../../ui/clipboard';
import YamlFrontMatterFormat from '../../ui/formats/yaml-front-matter';
import YamlFrontMatterParser from '../../util/frontmatter-yaml';

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
    'ui.screen',
    () => blessed.screen({ input: config.input, output: config.output })
  );

  container.registerService(
    'ui.interface',
    (screen, app, tracker, ui, logger, format, keys) => {
      return new BlessedInterface(
        screen,
        logger,
        format,
        keys
      );
    },
    ['ui.screen', 'logger', 'ui.formats.yaml-frontmatter', 'ui.keys']
  );

  container.registerService(
    'ui',
    (screen, ui, app, tracker, config, logger, format, keys) => {
      return new BlessedApplication(
        screen,
        ui,
        config,
        logger,
        format,
        keys,
        () => container.getMatching(['ui.controllers', 'ui.views'])
      );
    },
    ['ui.screen', 'ui.interface', 'app', 'tracker', 'config', 'logger', 'ui.formats.yaml-frontmatter', 'ui.keys']
  );

  return container;
}
