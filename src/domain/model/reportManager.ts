import Report               from './report';
import { SerializedReport } from './report';
import FilterSet            from './filterSet';
import Storage              from '../../app/services/storage';

export default class ReportManager {

  private readonly storage: Storage;
  private readonly reports: Report[];

  constructor(storage: Storage) {
    this.storage = storage;
    this.reports = this.unserialize(this.storage.get('reports', []));

    const def = this.get('default');
    if (def) {
      def.on('change', () => storage.set('reports', this.serialize()));
    }
  }

  public get(name: string): Report | null {
    return this.reports.find(report => report.name === name);
  }

  public addReport(name: string, filters: FilterSet): Report {
    const existing = this.get(name);

    if (existing) {
      existing.replaceFilters(filters);
    } else {
      this.reports.push(new Report(name, filters.clone()));
    }

    this.storage.set('reports', this.serialize());
    return this.get(name);
  }

  public serialize(): SerializedReport[] {
    return this.reports.map(report => report.serialize());
  }

  public unserialize(reports: SerializedReport[]): Report[] {
    return reports.map(report => new Report(
      report.name,
      FilterSet.unserialize(report.filters)
    ));
  }

  public getDefault(): Report {
    return this.get('default') || this.addReport('default', new FilterSet([]));
  }

}
