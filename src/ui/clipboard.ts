import Promise from 'bluebird';
import copyPaste from 'copy-paste';

export function copy(text: string): Promise[] {
  return new Promise((reject, resolve)  => {
    return copyPaste.copy(text, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export function paste(): Promise {
  return new Promise((reject, resolve) => {
    return copyPaste.paste((text, err) => {
      if (err) return reject(err);
      return resolve(text);
    });
  });
}
