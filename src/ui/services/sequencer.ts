import { EventEmitter } from 'events';

/**
 * Handles sequencing multiple keystrokes
 */
export default class Sequencer {
  /**
   * The leader (prefix) key denoting the start of a sequence
   */
  private readonly leader: string;

  /**
   * The capture timeout (in ms) before stopping recording
   */
  private readonly timeout: number;

  /**
   * Storage of nodes we've interacted with
   */
  private readonly config: NodeMap = {};

  /**
   * The internal key to attach to an emitter so we can identify it later
   */
  private static key = '___id';

  constructor(leader: string = ',', timeout: number = 1000) {
    this.leader = leader;
    this.timeout = timeout;
  }

  /**
   * Registers a sequence handler on the event emitter
   */
  public on(emitter: EventEmitter, keys: string, callback: Function): Sequencer {
    const node = this.identify(emitter);
    node.sequences.push({ keys, callback });
    return this;
  }

  /**
   * Removes the sequence handler
   */
  public remove(emitter: EventEmitter, sequence: string) {
    const node = this.identify(emitter);
    node.sequences = node.sequences.filter(seq => seq.keys !== sequence);
    return this;
  }

  /**
   * In order to key on a node, we first modify it with a random id we can
   * reference later
   */
  private identify(emitter: EventEmitter) {
    if (!emitter[Sequencer.key]) {
      emitter[Sequencer.key] = this.generateId(emitter);
      this.config[emitter[Sequencer.key]] = {
        sequences: [],
        captured: '',
        recording: false,
        emitter: emitter,
        disabledListeners: {}
      };
    }

    const node = this.config[emitter[Sequencer.key]];

    // listen for leader keystrokes
    const listeners = node.emitter.listeners(`key ${this.leader}`);
    if (!listeners.length) {
      node.emitter.on(`key ${this.leader}`, () => this.onLeader(node));
    }

    return this.config[emitter[Sequencer.key]];
  }

  /**
   * Generates a random id to associate a new node with
   */
  private generateId(node: any): string {
    return '' + Math.random() + Math.random() + JSON.stringify(node);
  }

  private onLeader(node: NodeConfig) {
    this.enableRecording(node);
    setTimeout(() => this.disableRecording(node), this.timeout);
  }

  /**
   * Once a leader is captured, we start recording by ignoring all of the
   * previous key events, and register a new catch-all handler
   * until the sequence times out or finishes
   */
  private enableRecording(node: NodeConfig) {
    if (node.recording) return;

    // Stash the current keypress hanlders
    node.disabledListeners = { keypress: node.emitter.listeners('keypress') };
    node.emitter.removeAllListeners('keypress');

    // Stash the "key $letter" listeners
    this.getLetters().forEach(letter => {
      const event = `key ${letter}`;
      node.disabledListeners[event] = node.emitter.listeners(event);
      node.emitter.removeAllListeners(event);
    });

    // All keystrokes get intercepted
    node.emitter.on('keypress', (ch, key) => this.catchAll(node, [ch, key]));
    node.recording = true;
    node.captured = '';
  }

  /**
   * Stops recording and puts everything back
   */
  private disableRecording(node: NodeConfig) {
    if (!node.recording) return;

    // Stop interepting everything
    node.emitter.removeListener('keypress', this.catchAll);

    // Restore all of our stashed handlers
    Object.keys(node.disabledListeners).forEach(disabledEvent => {
      node.disabledListeners[disabledEvent].forEach(handler => {
        node.emitter.on(disabledEvent, handler);
      });
    });

    if (node.emitter['screen']) node.emitter['screen'].render();
    node.recording = false;
  }

  /**
   * Handle a keystroke on a node while in capture mode
   */
  private catchAll(node: NodeConfig, [ch, key]) {
    node.captured += key.sequence;

    const match = node.sequences.find(sequence => sequence.keys === node.captured);
    if (match) {
      match.callback();
      this.disableRecording(node);
    }
  }

  /**
   * Get all possible letters to listen for
   */
  private getLetters(): string[] {
    const letters = [];
    for (let i = 97; i <= 122; i++) {
      letters.push(String.fromCharCode(i));
    }
    return letters;
  }
}

interface NodeMap {
  [key: string]: NodeConfig
}

interface NodeConfig {
  sequences: Sequence[],
  captured: string,
  recording: boolean,
  emitter: EventEmitter,
  disabledListeners: Object
}

interface Sequence {
  keys: string,
  callback: Function
}
