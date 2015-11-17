'use strict';

var Promise      = require('bluebird');
var prompt       = require('./widgets/prompt');
var promptList   = require('./widgets/promptList');
var Cancellation = require('../domain/errors/cancellation');

module.exports = function UserInput(parent, keys) {
  var self = this;

  /**
   * Asks the user a question and returns the promise of an answer
   *
   * @param {String} text - question to ask
   * @return {Promise<String>}
   */
  this.ask = function(text) {
    return new Promise(function(resolve, reject) {
      var input = prompt(text, parent);
      input.key(keys['input.cancel'], function() {
        parent.remove(input);
        parent.screen.render();
        reject(new Cancellation());
      });

      input.readInput(function(err, text) {
        input.remove();
        respondOrCancel(text, resolve, reject);
      });

    });
  };

  /**
   * Asks the user to pick from a list and returns the promise of a selection
   *
   * @param {String} text - question to ask
   * @param {Array<String> options
   * @return {Promise<String>}
   */
  this.selectFromList = function(text, options) {
    return new Promise(function(resolve, reject) {
      var list = promptList(text, parent, options);

      list.on('select', function(item, i) {
        parent.remove(list);
        parent.render();
        respondOrCancel(item.content, resolve, reject);
      });

      list.key(keys.back, function() {
        parent.remove(list);
        parent.screen.render();
        reject(new Cancellation());
      });
    });
  };

  /**
   * Returns a function which asks a question, with the options as
   * the first argument
   *
   * @param {String} text - question to ask
   * @return {Function}
   */
  this.selectFromListWith = function(text) {
    return function(options) {
      return self.selectFromList(text, options);
    };
  };

  /**
   * Asks the user for input via their $EDITOR
   *
   * @param {String} initial
   * @return {Promise<String>} entered text
   */
  this.editExternally = function(initial) {
    return new Promise(function(resolve, reject) {
      parent.readEditor({ value: initial }, function(err, text) {
        if (err) return reject(err);
        if(text === initial) return reject(new Cancellation());
        respondOrCancel(text, resolve, reject);
      });
    });
  };

  /**
   * Fulfils the promise if text is non-empty, rejects
   * with a Cancellation otherwise
   *
   * @param {String} text
   * @param {Function} reject
   * @param {Function} resolve
   */
  var respondOrCancel = function(text, resolve, reject) {
    if (text) {
      resolve(text);
    } else {
      reject(new Cancellation());
    }
  };

};
