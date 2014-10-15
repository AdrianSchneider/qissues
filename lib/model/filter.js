module.exports = Filter;

/**
 * Represents a filter on the issues list
 */
function Filter(type, value) {
  /**
   * Returns the type
   * @return string
   */
  this.getType = function() {
    return type;
  };

  /**
   * Returns the value
   * @return string
   */
  this.getValue = function() {
    return value;
  };

  /**
   * Returns a flat object
   * @return object
   */
  this.serialize = function() {
    return {
      type: type,
      value: value
    };
  };
}
