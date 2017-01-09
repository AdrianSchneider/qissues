import Report        from '../domain/model/report';
import ReportManager from '../domain/model/reportManager';
import FilterSet     from '../domain/model/filterSet';
import IssueTracker  from '../domain/model/tracker';

export default class Application {

  private readonly reportManager: ReportManager;
  private readonly tracker: IssueTracker;

  private _exit: Function;

  constructor(tracker: IssueTracker, reportManager: ReportManager) {
    this.tracker = tracker;
    this.reportManager = reportManager;
  }

  public start(ui, opts) {
    ui.start(this, this.tracker, opts);
  }

  public exit(f: Function) {
    this._exit = f;
  }

  public getActiveReport(): Report {
    return this.reportManager.getDefault();
  }

  public getReports(): ReportManager {
    return this.reportManager;
  }

  public getFilters(): FilterSet {
    return this.getActiveReport().filters;
  }

  public onExit() {
    this._exit();
  };
}
