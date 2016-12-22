import Report        from '../domain/model/report';
import ReportManager from '../domain/model/reportManager';
import FilterSet     from '../domain/model/filterset';

export default class Application {

  public readonly reportManager: ReportManager;
  private _exit: Function;

  constructor(reportManager: ReportManager) {
    this.reportManager = reportManager;
  }

  public start(ui) {
    ui.start();
  }

  public exit(f: Function) {
    this._exit = f;
  }

  public getActiveReport(): Report {
    return this.reportManager.getDefault();
  }

  public getFilters(): FilterSet {
    return this.getActiveReport().filters;
  }

  public onExit() {
    this._exit();
  };
}
