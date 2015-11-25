'use strict';

var Promise      = require('bluebird');
var prompt       = require('./widgets/prompt');
var promptList   = require('./widgets/promptList');
var Cancellation = require('../domain/errors/cancellation');

module.exports = function UserInput(parent, keys, logger) {
  var self = this;
  var loadingMessage = 'Loading...';

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
        logger.debug('Selected ' + item.originalContent);
        parent.remove(list);
        parent.render();
        respondOrCancel(item.originalContent, resolve, reject);
      });

      list.key(keys.back, function() {
        logger.debug('Back; closing promptList');
        parent.remove(list);
        parent.screen.render();
        reject(new Cancellation());
        return false;
      });
    });
  };

  /**
   * Asks the user to pick from a list using a data provider
   * Refreshable
   *
   * @param {String} text - question to ask
   * @param {Array<String> options
   * @return {Promise<String>}
   */
  this.selectFromCallableList = function(text, provider) {
    return new Promise(function(resolve, reject) {
      var list = promptList(text, parent, [loadingMessage], parent);

      var setItems = function(options) {
        list.setItems(options.map(String));
        parent.screen.render();
      };

      list.on('select', function(item, i) {
        logger.debug('Selected ' + item.originalContent);
        parent.remove(list);
        parent.screen.render();
        respondOrCancel(item.originalContent, resolve, reject);
      });

      list.key(keys.back, function() {
        logger.debug('Back; closing promptList');
        parent.remove(list);
        parent.screen.render();
        reject(new Cancellation());
      });

      list.key(keys.refresh, function() {
        logger.debug('Refreshing promptList');
        setItems([loadingMessage]);
        provider(true).then(setItems);
      });

      provider().then(setItems);
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
        if (text === initial) return reject(new Cancellation());
        respondOrCancel(text, resolve, reject);
      });
    })
    .catch({ code: 'ENOENT' }, function() {
      throw new Cancellation();
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
    if (text && text !== loadingMessage) {
      resolve(text);
    } else {
      reject(new Cancellation());
    }
  };

};
