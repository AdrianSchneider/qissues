module.exports = Filter;

function Filter(type, value) {
  this.getType = function() {
    return type;
  };

  this.getValue = function() {
    return value;
  };

  this.serialize = function() {
    return {
      type: type,
      value: value
    };
  };
}
