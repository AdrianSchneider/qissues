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

  var sequence;
  var sequences = {};
  var disabledListeners;

  /**
   * Adds a sequenced event listener
   */
  this.on = function(keys, callback) {
    setupSequenceHandler(node);
    sequences[keys] = callback.bind(node);
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
    sequence = '';
    setTimeout(disableRecording, timeout || 500);
  };

  /**
   * Triggered when a key is pressed after the leader key
   */
  var catchAll = function(ch, key) {
    sequence += key.full;

    if(typeof sequences[sequence] !== 'undefined') {
      sequences[sequence]();
      disableRecording();
    }
  };

  /**
   * Enables recording of all keys to build sequences
   */
  var enableRecording = function() {
    disabledListeners = node.listeners('keypress');
    node.removeAllListeners('keypress');

    node.on('keypress', catchAll);
  };

  /**
   * Disables recording, restting the standard event behaviour
   */
  var disableRecording = function() {
    node.removeListener('keypress', catchAll);

    disabledListeners.forEach(function(listener) {
      node.on('keypress', listener);
    });

    node.screen.render();
  };
};
