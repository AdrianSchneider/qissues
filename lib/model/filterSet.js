var _            = require('underscore');
var util         = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * Represents a set of issue filters
 *
 * @param Filter[] initialFilters
 */
function FilterSet(initialFilters) {
  var filters = [];
  _.each(initialFilters || [], this.add);

  /**
   * Get the filters
   *
   * @return Filter[]
   */
  this.get = function() {
    return filters.map(function(filter) {
      return [filter.getType(), filter.getValue()];
    });
  };

  /**
   * Add a new filter
   *
   * @param Filter
   */
  this.add = function(filter) {
    filters.push(filter);
    this.emit('change');
  };

  /**
   * Removes a filter
   * @param number i
   */
  this.remove = function(i) {
    filters.splice(i, 1);
    this.emit('change');
  };

  /**
   * Serializes the filters into basic objects
   *
   * @return array
   */
  this.serialize = function() {
    return _.invoke(filters, 'serialize');
  };
}

util.inherits(FilterSet, EventEmitter);
module.exports = FilterSet;
