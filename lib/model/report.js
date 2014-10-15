module.exports = Report;

/**
 * Represets a named set of filters
 *
 * @param string name
 * @param FilterSet
 */
function Report(name, setFilters) {
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
}
