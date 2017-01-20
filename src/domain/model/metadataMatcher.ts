import * as Promise    from 'bluebird';
import Project         from './meta/project';
import User            from './meta/user';
import Type            from './meta/type';
import Sprint          from './meta/sprint';
import ValidationError from '../errors/validation';
import Metadata        from './trackerMetadata';

export default class MetadataMatcher {
  private metadata: Metadata;
  constructor(metadata: Metadata) {
    this.metadata = metadata;
  }

  public matchProject(name: string): Promise<Project> {
    return this.matchOrThrow(this.metadata.getProjects(), name, 'project', ['id', 'name']);
  }

  public matchUser(name: string): Promise<User> {
    return this.matchOrThrow(this.metadata.getUsers(), name, 'user', ['account', 'name']);
  }

  public matchType(name: string): Promise<Type> {
    return this.matchOrThrow(this.metadata.getTypes(), name, 'type', ['name']);
  }

  public matchSprint(name: string): Promise<Sprint> {
    return this.matchOrThrow(this.metadata.getSprints(), name, 'sprint', ['name']);
  }

  private matchOrThrow<T>(promised: Promise<T[]>, name: string, type: string, fields: string[]): Promise<T> {
    console.trace('#matchOrThrow');
    return promised.then(data => {
      const row = data.find(this.matchField(name, fields));
      if (!row) throw new ValidationError(`${name} is not a valid ${type}`);
      return Promise.resolve(row);
    });
  }

  private matchField(text: string, fields: string[]): (Object) => boolean {
    return doc => {
      if(typeof doc === 'string') {
        return doc.toLowerCase().indexOf(text.toLowerCase()) !== -1;
      }

      for (var i in fields) {
        const val = "" + doc[fields[i]];
        if (!val) return false;

        if(val.toLowerCase().indexOf(text.toLowerCase()) !== -1) {
          return true;
        }
      }

      return false;
    };
  }

}
