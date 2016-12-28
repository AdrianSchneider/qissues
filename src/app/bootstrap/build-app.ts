import Application     from '../main';
import Container       from '../services/container';
import Storage         from '../services/storage';
import BootstrapParams from '../config/bootstrap';
import ReportManager   from '../../domain/model/reportManager';
import IssueTracker    from '../../domain/model/tracker';

export default function(container: Container, config: BootstrapParams): Container {
  container.registerService(
    'app',
    (tracker: IssueTracker, reportManager: ReportManager) => new Application(tracker, reportManager),
    ['tracker', 'domain.report-manager']
  );

  container.registerService(
    'domain.report-manager',
    (storage: Storage) => new ReportManager(storage),
    ['storage']
  );

  return container;
}
