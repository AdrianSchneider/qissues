module.exports = Assignee;

function Assignee(name) {
  this.getName = function() {
    return name;
  };

  this.toString = function() {
    return name;
  };
}
