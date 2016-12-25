import Expectations from '../../../model/expectations';

export default new Expectations({
  domain:   { type: 'string', required: true, default: '' },
  username: { type: 'string', required: true, default: '' },
  password: { type: 'string', required: true, default: '' }
});
