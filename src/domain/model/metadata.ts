import { SerializedProject } from './meta/project';
import { SerializedUser }    from './meta/user';
import { SerializedType }    from './meta/type';
import { SerializedSprint }  from './meta/sprint';
import ValidationError       from '../errors/validation';

export interface RawMetadata {
  projects: SerializedProject[],
  users: SerializedUser[],
  types: SerializedType[],
  sprints: SerializedSprint[]
}

export default class Metadata {
  private metadata: RawMetadata;

  constructor(data: RawMetadata) {
    this.metadata = data;
  }

  public matchProject(name: string): SerializedProject {
    const project = this.metadata.projects.find(this.matchField(name, ['key', 'name']));
    if (!project) throw new ValidationError(`${name} is not a valid project`);
    return project;
  }

  public matchUser(name: string): SerializedUser {
    const user = this.metadata.users.find(this.matchField(name, ['name']));
    if (!user) throw new ValidationError(`${name} is not a valid user`);
    return user;
  }

  public matchType(name: string): SerializedType {
    const type = this.metadata.types.find(this.matchField(name, ['name']));
    if (!type) throw new ValidationError(`${name} is not a valid type`);
    return type;
  }

  public matchSprint(name: string): SerializedSprint {
    const sprint = this.metadata.sprints.find(this.matchField(name, ['name']));
    if (!sprint) throw new ValidationError(`${name} is not a valid sprint`);
    return sprint;
  }

  private matchField(text: string, fields: string[]) {
    return doc => {
      if(typeof doc === 'string') {
        return doc.toLowerCase().indexOf(text.toLowerCase()) !== -1;
      }

      for (var i in fields) {
        if(doc[fields[i]].toLowerCase().indexOf(text.toLowerCase()) !== -1) {
          return true;
        }
      }

      return false;
    };
  }

}
