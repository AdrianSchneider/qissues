import * as Promise from 'bluebird';
import * as copyPaste from 'copy-paste';

export default class Clipboard {

  public copy(text: string): Promise<any> {
    return new Promise((resolve, reject) => {
      copyPaste.copy(text, (err: Error) => {
        if (err) return reject(err);
        resolve();
      });
    });
  };

  public paste(): Promise<any> {
    return new Promise((resolve, reject) => {
      return copyPaste.paste((text: string, err) => {
        if (err) return reject(err);
        return resolve(text);
      });
    });
  }
}

// backwards compatible
export function copy(text: string): Promise<any> {
  return (new Clipboard()).copy(text);
}

// backwards compatible
export function paste(): Promise<any> {
  return (new Clipboard()).paste();
}
