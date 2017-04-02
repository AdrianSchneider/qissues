import buildApp         from './build-app';
import buildCore        from './build-core';
import buildJira        from './build-jira';
import buildUi          from './build-ui';
import buildViews       from './build-views';
import buildControllers from './build-controllers';
import BootstrapParams  from '../config/bootstrap';
import Container        from '../../system/container';

/**
 * Exports a fully provisioned container
 *
 * @return {Container}
 */
export default config => {
  const builders = [
    buildApp,
    buildCore,
    buildJira,
    buildUi,
    buildViews,
    buildControllers
  ];

  return builders.reduce(
    (
      container: Container,
      builder: (container: Container, config: BootstrapParams) => Container
    ) => builder(container, config),
    new Container()
  )
};
