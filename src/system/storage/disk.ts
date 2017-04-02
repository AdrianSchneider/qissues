import * as fs from 'fs';
import MemoryStorage from './memory';

export default class DiskStorage extends MemoryStorage {
  protected readonly filename: string;
  protected readonly data: Object;

  constructor(filename: string) {
    if (!fs.existsSync(filename)) {
      fs.writeFileSync(filename, '{}');
    }

    super(require(filename));
    this.filename = filename;
  }

  protected flush(): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.writeFileSync(this.filename, JSON.stringify(this.data, null, 2), err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  }
}
