module.exports = Report;

function Report(name, setFilters) {
  var filters = setFilters.clone();

  this.getName = function() {
    return name;
  };

  this.getFilters = function() {
    return filters;
  };

  this.serialize = function() {
    return {
      name: name,
      filters: filters.serialize()
    };
  };
}
