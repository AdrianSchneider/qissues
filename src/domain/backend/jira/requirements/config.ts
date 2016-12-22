import Expectations from '../../../model/expectations';

const config = new Expectations({
  domain:   { type: 'string', required: true, default: '' },
  username: { type: 'string', required: true, default: '' },
  password: { type: 'string', required: true, default: '' }
});

export default config;
