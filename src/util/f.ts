import * as Promise from 'bluebird';

/**
 * Returns a function which copies its input to data[key] before sending it out again
 *
 * @param {Object} data - object to mutate
 * @param {String} key - key to mutate in object
 * @return {Function} to continue promise chain
 */
export function tee(data: Object, key: string): <T> (input: T) => Promise<T> {
  return input => {
    data[key] = input;
    return Promise.resolve(input);
  };
}

/**
 * Prepends text before a list of options once they resolve
 *
 * @param {Function} getOptions - returns promise of options
 * @param {String} prependedOption
 * @return {Function} - returning {Promise<Array>}
 */
export function prepend(getOptions: Function, prependedOption: string) {
  return (): Promise => getOptions()
    .then(options => [prependedOption].concat(options));
}
