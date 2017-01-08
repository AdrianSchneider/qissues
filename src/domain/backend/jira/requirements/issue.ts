import Expectations from '../../../model/expectations';
import User         from '../../../model/meta/user';
import Type         from '../../../model/meta/type';
import Sprint       from '../../../model/meta/sprint';

export const create = metadata => new Expectations({
  project     : { type: 'string', required: true,  default: '', choices: () => metadata.getProjects() },
  title       : { type: 'string', required: true,  default: '' },
  description : { type: 'string', required: false, default: '' },
  type        : { type: 'string', required: true,  default: '', choices: () => metadata.getTypes() },
  assignee    : { type: 'string', required: false, default: '', choices: () => metadata.getUsers() },
  sprint      : { type: 'string', required: false, default: '', choices: () => metadata.getSprints() }
});

export const update = metadata => new Expectations({
  title       : { type: 'string', required: true,  default: '' },
  description : { type: 'string', required: false, default: '' },
  type        : { type: 'string', required: true,  default: '', choices: () => metadata.getTypes() },
  assignee    : { type: 'string', required: false, default: '', choices: () => metadata.getUsers() },
  sprint      : { type: 'string', required: false, default: '', choices: () => metadata.getSprints() }
});
