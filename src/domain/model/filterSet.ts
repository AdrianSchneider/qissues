import * as _             from 'underscore';
import Filter             from './filter';
import {SerializedFilter} from './filter';
import { EventEmitter }   from 'events';

/**
 * Represents a set of filtering rules
 */
export default class FilterSet extends EventEmitter {
  public readonly filters: Filter[];

  constructor(filters: Filter[]) {
    super();
    this.filters = [];
    filters.forEach(filter => this.add(filter));
  }

  public get() {
    return this.filters.map((filter: Filter) => [filter.type, filter.value]);
  }

  public add(filter: Filter) {
    this.filters.push(filter);
    this.emit('change');
  }

  public remove(i: number) {
    this.filters.splice(i, 1);
    this.emit('change');
  }

  public serialize(): SerializedFilter[] {
    return this.filters.map(filter => filter.serialize());
  }

  public getValuesByType(type: string): Filter[] {
    return [].concat(
      this.filters
        .filter(filter => filter.type === type)
        .map(filter => filter.value)
    );
  }

  /**
   * Flattens filters, combining similar ones
   */
  public flatten(): Filter[] {
    return _.pairs(this.filters.reduce((out, filter) => {
      if(typeof out[filter.type] === 'undefined') {
        out[filter.type] = [];
      }

      if (_.isArray(filter.value)) {
        _.each(filter.value, value => out[filter.type].push(value));
      } else {
        out[filter.type].push(filter.value);
      }

      return out;
    }, {}));
  }

  public clone(): FilterSet {
    return new FilterSet(
      this.get().map(([type, value]) => new Filter(type, value))
    );
  }

  /**
   * Maps over the filters
   */
  public map(func: (f: Filter) => any): any[] {
    return this.filters.map(func);
  }

  public toValues(): Object {
    return this.filters.reduce(
      (out: Object, filter: Filter) => ({ ...out, [filter.type]: filter.value }),
      {}
    );
  }

  public static unserialize(filters: SerializedFilter[]): FilterSet {
    return new FilterSet(filters.map(Filter.unserialize));
  }

}
