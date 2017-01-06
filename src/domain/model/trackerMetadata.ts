import Type     from './meta/type';
import User     from './meta/user';
import Sprint   from './meta/sprint';
import Label    from './meta/label';
import Priority from './meta/priority';
import Status   from './meta/status';
import Project  from './meta/project';

interface TrackerMetadata {
  getTypes:    () => Promise<Type[]>;
  getUsers:    () => Promise<User[]>;
  getSprints:  () => Promise<Sprint[]>;
  getLabels:   () => Promise<Label[]>;
  getProjects: () => Promise<Project[]>;
  getStatuses: () => Promise<Status[]>;
}

export default TrackerMetadata;
