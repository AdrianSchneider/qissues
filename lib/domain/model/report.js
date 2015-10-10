var util         = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * Represets a named set of filters
 *
 * @param string name
 * @param FilterSet
 */
function Report(name, setFilters) {
  var self = this;
  var filters = setFilters.clone();

  /**
   * Returns the name
   * @return string
   */
  this.getName = function() {
    return name;
  };

  /**
   * Returns the filters
   * @return FilterSet
   */
  this.getFilters = function() {
    return filters;
  };

  this.replaceFilters = function(filterSet) {
    filters = filterSet.clone();
    self.emit('change');
  };

  /**
   * Flattens the report recursively
   * @return object
   */
  this.serialize = function() {
    return {
      name: name,
      filters: filters.serialize()
    };
  };

  filters.on('change', function() {
    self.emit('change');
  });
}

util.inherits(Report, EventEmitter);
module.exports = Report;
