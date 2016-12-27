import buildApp        from './build-app';
import buildCore       from './build-core';
import buildJira       from './build-jira';
import buildUi         from './build-ui';
import Container       from '../services/container';
import BootstrapParams from './../config/bootstrap';


/**
 * Exports a fully provisioned container
 *
 * @return {Container}
 */
export default config => {
  return [buildApp, buildCore, buildJira, buildUi].reduce(
    (
      container: Container,
      builder: (container: Container, config: BootstrapParams) => Container
    ) => builder(container, config),
    new Container()
  )
};
