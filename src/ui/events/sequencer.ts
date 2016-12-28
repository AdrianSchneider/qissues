import * as blessed from 'blessed';

class Sequencer {
  private readonly node: blessed.Widgets.Node;
  private readonly leader: string;
  private readonly timeout: number;

  private recording: boolean;

  constructor(node: blessed.Widgets.Node, leader: string, timeout: number) {
    this.node = node;
    this.leader = leader;
    this.timeout = timeout;
    this.recording = false;
  }

  /**
   * Adds a sequenced event listener
   */
  public on(keys: string, callback: Function): Sequencer {
    return this;
  }

  /**
   * Removes a sequenced event listener
   */
  public remove(keys: string): Sequencer {
    return this;
  }

  /**
   * Ensures the node has a sequencer handler set up
   */
  private setupSequenceHandler() {
    var listeners = this.node.listeners('key ' + this.leader);
    if (!listeners.length) {
      this.node.on('key ' + this.leader, this.onLeader);
    }
  };

  /**
   * Denotes the start of a sequence
   */
  private onLeader() {
    this.enableRecording();
    this.node.sequence = '';
    setTimeout(this.disableRecording, this.timeout);
  }

  /**
   * Begin capturing keystrokes
   */
  private enableRecording() {
    if (this.recording) return;

    this.node.disabledListeners = {
      keypress: this.node.listeners('keypress')
    };

    this.node.removeAllListeners('keypress');

    this.getLetters().forEach(letter => {
      const event = 'key ' + letter;
      this.node.disabledListeners[event] = this.node.listeners(event);
      this.node.removeAllListeners(event);
    });

    this.node.on('keypress', this.catchAll);
    this.recording = true;
  }

  /**
   * Stop capturing keystrokes
   */
  private disableRecording() {
    if (!this.recording) return;
    this.node.removeListener('keypress', this.catchAll);

    Object.keys(this.node.disabledListeners).forEach(disabledEvent => {
      this.node.disabledListeners[disabledEvent].forEach(handler => {
        this.node.on(disabledEvent, handler);
      });
    });

    this.node.screen.render();
    this.recording = false;
  }

  /**
   * Handle a keystroke
   */
  private catchAll(ch, key) {
    this.node.sequence += key.sequence;

    if(typeof this.node.sequences[this.node.sequence] !== 'undefined') {
      this.node.sequences[this.node.sequence]();
      this.disableRecording();
    }
  }

  /**
   * Get all possible letters to listen for
   */
  private getLetters(): string[] {
    const letters = [];
    for (var i = 97; i <= 122; i++) {
      letters.push(String.fromCharCode(i));
    }
    return letters;
  }
}

export default function attach(view, leader, timeout) {
  return new Sequencer(view, leader, timeout);
}
