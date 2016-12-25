import Container     from '../services/container';
import Application   from '../main';
import ReportManager from '../../domain/model/reportManager';

export default function(container: Container, config: Object): Container {
  container.registerService(
    'app',
    function(reportManager) { return new Application(reportManager); },
    ['domain.report-manager']
  );

  container.registerService(
    'domain.report-manager',
    function(storage) { return new ReportManager(storage); },
    ['storage']
  );

  return container;
}
