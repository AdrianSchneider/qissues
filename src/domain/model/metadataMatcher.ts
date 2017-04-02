import { partition }   from 'underscore';
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

  private async matchOrThrow<T>(promised: Promise<T[]>, name: string, type: string, fields: string[]): Promise<T> {
    const data = await promised;
    const input = name.toLowerCase();

    const matches = data
      .map(this.getMatch(input, fields))
      .reduce((rows, row) => rows.concat(row), [])
      .filter(([obj, match]) => match && match.indexOf(input) !== -1);

    const [exacts, partials] = partition(matches, ([obj, match]) => match === input);

    if (exacts.length == 1) {
      return Promise.resolve(exacts[0][0]);
    }

    if (partials.length > 1) {
      const options = partials.map(row => row[1]).join(' or ');
      throw new ValidationError(`${type} of ${name} is ambiguous; did you want ${options}?`);
    }

    if (!partials.length) throw new ValidationError(`${name} is not a valid ${type}`);
    return Promise.resolve(partials[0][0]);
  }

  private getMatch(text: string, fields: string[]): (Object) => Array<any> {
    return doc => {
      if(typeof doc === 'string') {
        return [[doc, doc.toLowerCase()]];
      }

      const results = [];
      for (var i in fields) {
        const val = "" + doc[fields[i]];
        if (!val) continue;
        results.push([doc, val.toLowerCase()]);
      }

      return results;
    };
  }

}
