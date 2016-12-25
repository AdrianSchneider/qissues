const defaults = require('./keys.defaults.json');

export default function(config) {
  return { ...defaults, ...config.keys || {} };
};
