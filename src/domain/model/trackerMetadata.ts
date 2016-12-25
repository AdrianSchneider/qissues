import Type     from './meta/type';
import User     from './meta/user';
import Sprint   from './meta/sprint';
import Label    from './meta/label';
import Priority from './meta/priority';
import Status   from './meta/status';
import Project  from './meta/project';

interface TrackerMetadata {
  getTypes:    (invalidate: boolean) => Promise<Type[]>;
  getUsers:    (invalidate: boolean) => Promise<User[]>;
  getSprints:  (invalidate: boolean) => Promise<Sprint[]>;
  getLabels:   (invalidate: boolean) => Promise<Label[]>;
  getProjects: (invalidate: boolean) => Promise<Project[]>;
}

export default TrackerMetadata;
