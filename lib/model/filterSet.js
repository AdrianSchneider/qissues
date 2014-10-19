var _            = require('underscore');
var util         = require('util');
var Filter       = require('./filter');
var EventEmitter = require('events').EventEmitter;

/**
 * Represents a set of issue filters
 *
 * @param Filter[] initialFilters
 */
function FilterSet(initialFilters) {
  var filters = [];
  var self = this;

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
    self.emit('change');
  };

  this.getValuesByType = function(type) {
    var out = filters.filter(function(filter) {
      return filter.getType() === type;
    }).map(function(filter) {
      return filter.getValue();
    });

    return [].concat.apply([],out);
  };

  /**
   * Removes a filter
   * @param number i
   */
  this.remove = function(i) {
    filters.splice(i, 1);
    self.emit('change');
  };

  /**
   * Serializes the filters into basic objects
   *
   * @return array
   */
  this.serialize = function() {
    return _.invoke(filters, 'serialize');
  };

  /**
   * Flattens the filters, combining similar ones
   * @return array
   */
  this.flatten = function() {
    return _.pairs(filters.reduce(function(out, filter) {
      if(typeof out[filter.getType()] === 'undefined') {
        out[filter.getType()] = [];
      }

      if(_.isArray(filter.getValue())) {
        _.each(filter.getValue(), function(value) {
          out[filter.getType()].push(value);
        });
      } else {
        out[filter.getType()].push(filter.getValue());
      }

      return out;
    }, {}));
  };

  /**
   * Creates a new filterset from this one
   * @return FilterSet
   */
  this.clone = function() {
    return new FilterSet(self.flatten().map(function(filter) {
      return new Filter(filter[0], filter[1]);
    }));
  };

  _.each(initialFilters || [], self.add);
}

util.inherits(FilterSet, EventEmitter);
module.exports = FilterSet;
