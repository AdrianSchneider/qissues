import Expectations from '../../../model/expectations';
import User         from '../../../model/meta/user';
import Type         from '../../../model/meta/type';
import Sprint       from '../../../model/meta/sprint';

export const create = (metadata, matcher) => new Expectations({
  project     : { type: 'string', required: true,  default: '',
    choices: () => metadata.getProjects(),
    matcher: input => matcher.matchProject(input).then(match => match.toString())
  },
  title       : { type: 'string', required: true,  default: '' },
  description : { type: 'string', required: false, default: '' },
  type        : { type: 'string', required: true,  default: '',
    choices: () => metadata.getTypes(),
    matcher: input => matcher.matchType(input).then(match => match.toString())
  },
  assignee    : { type: 'string', required: false, default: '',
    choices: () => metadata.getUsers(),
    matcher: input => matcher.matchUser(input).then(match => match.toString())
  },
  sprint      : { type: 'string', required: false, default: '',
    choices: () => metadata.getSprints(),
    matcher: input => matcher.matchSprint(input).then(match => match.toString())
  }
});

export const update = (metadata, matcher) => new Expectations({
  title       : { type: 'string', required: true,  default: '' },
  description : { type: 'string', required: false, default: '' },
  type        : { type: 'string', required: true,  default: '',
    choices: () => metadata.getTypes(),
    matcher: input => matcher.matchProject(input).then(match => match.toString())
  },
  assignee    : { type: 'string', required: false, default: '',
    choices: () => metadata.getUsers(),
    matcher: input => matcher.matchUser(input).then(match => match.toString())
  },
  sprint      : { type: 'string', required: false, default: '',
    choices: () => metadata.getSprints(),
    matcher: input => matcher.matchSprint(input).then(match => match.toString())
  }
});
