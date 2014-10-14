module.exports = Report;

function Report(name, filters) {
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
