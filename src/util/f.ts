/**
 * Prepends text before a list of options once they resolve
 *
 * @param {Function} getOptions - returns promise of options
 * @param {String} prependedOption
 * @return {Function} - returning {Promise<Array>}
 */
export function prepend(getOptions: Function, prependedOption: string) {
  return (): Promise<any> => getOptions()
    .then(options => [prependedOption].concat(options));
}
