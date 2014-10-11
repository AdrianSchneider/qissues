var fs = require('fs');

module.exports = function(file) {
  if(file) {
    var logger = fs.createWriteStream(file, {'flags': 'a'});
  }

  this.log = function(text) {
    if(!file) return;
    logger.write(text + '\n');
  };

};
