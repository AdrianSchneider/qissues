'use strict';

var sprintf = require('util').format;
var spawn   = require('child_process').spawn;

module.exports = function(preferredBrowser) {
  /**
   * Opens the url in an external browser
   *
   * @param {String} url
   */
  this.open = function(url) {
    var browser = preferredBrowser || getDefaultBrowser();
    if(!browser) { 
      throw new Error('Could not detect browser; please configure "browser" option');
    }

    spawn(browser, [url]);
  };

  /**
   * Attempts to find a sane default
   * @return {String|undefined}
   */
  var getDefaultBrowser = function() {
    if (process.platform === 'darwin') return 'open';
    if (process.platform === 'linux')  return 'xdg-open';
  };
};
