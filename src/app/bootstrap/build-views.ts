import Container       from '../services/container';
import BootstrapParams from './../config/bootstrap';

export default function(container: Container, config: BootstrapParams) {
  container.registerService(
    'ui.views',
    () => null
  );

  return container;
}
