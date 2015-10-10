/**
 * Assists a node with sequential key combinations
 *
 * @param blessed.node node
 * @param string       leader ex (',')
 * @param number       timeout in ms
 */
module.exports = function Sequencer(node, leader, timeout) {
  timeout = timeout || 500;
  leader  = leader || ',';

  node.sequence = '';
  node.sequences = node.sequences || {};
  node.disabledListeners = node.disabledListeners || [];

  /**
   * Adds a sequenced event listener
   */
  this.on = function(keys, callback) {
    setupSequenceHandler(node);
    node.sequences[keys] = callback.bind(node);
    return this;
  };

  /**
   * Removes a sequenced event listener
   */
  this.remove = function(keys) {
    delete sequences[keys];
    return this;
  };

  /**
   * Ensures the node has a sequencer handler set up
   */
  var setupSequenceHandler = function() {
    var listeners = node.listeners('key ' + leader);
    if(!listeners.length) {
      node.on('key ' + leader, onLeader);
    }
  };

  /**
   * Triggered when the leader key is first pressed, starting
   * a new sequence
   */
  var onLeader = function() {
    enableRecording();
    node.sequence = '';
    setTimeout(disableRecording, timeout || 500);
  };

  /**
   * Triggered when a key is pressed after the leader key
   */
  var catchAll = function(ch, key) {
    node.sequence += key.sequence;

    if(typeof node.sequences[node.sequence] !== 'undefined') {
      node.sequences[node.sequence]();
      disableRecording();
    }
  };

  /**
   * Enables recording of all keys to build sequences
   */
  var enableRecording = function() {
    node.disabledListeners = {
      keypress: node.listeners('keypress')
    };

    node.removeAllListeners('keypress');

    getLetters().forEach(function(letter) {
      var event = 'key ' + letter;
      node.disabledListeners[event] = node.listeners(event);
      node.removeAllListeners(event);
    });

    node.on('keypress', catchAll);
  };

  /**
   * Disables recording, restting the standard event behaviour
   */
  var disableRecording = function() {
    node.removeListener('keypress', catchAll);

    Object.keys(node.disabledListeners).forEach(function(disabledEvent) {
      node.disabledListeners[disabledEvent].forEach(function(handler) {
        node.on(disabledEvent, handler);
      });
    });

    node.screen.render();
  };

  var getLetters = function() {
    var letters = [];
    for (var i = 97; i <= 122; i++) {
      letters.push(String.fromCharCode(i));
    }
    return letters;
  };
};
