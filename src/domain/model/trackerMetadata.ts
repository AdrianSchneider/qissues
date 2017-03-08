import Type         from './meta/type';
import User         from './meta/user';
import Sprint       from './meta/sprint';
import Label        from './meta/label';
import Priority     from './meta/priority';
import Status       from './meta/status';
import Project      from './meta/project';

interface TrackerMetadata {
  getTypes:    (options?: Object) => Promise<Type[]>;
  getUsers:    (options?: Object) => Promise<User[]>;
  getSprints:  (options?: Object) => Promise<Sprint[]>;
  getLabels:   (options?: Object) => Promise<Label[]>;
  getProjects: (options?: Object) => Promise<Project[]>;
  getStatuses: (options?: Object) => Promise<Status[]>;
}

export default TrackerMetadata;
