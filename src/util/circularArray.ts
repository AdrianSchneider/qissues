/**
 * Get the next index of an array, circling back to 0 after
 *
 * @param {Array} array - the array to cycle through
 * @param {Number} index - the current index
 * @return {Number} - the final index
 */
export function nextIndex(array: any[], index: number) {
  const next = index + 1;
  if (typeof array[next] === 'undefined') return 0;
  return next;
}

/**
 * Get the previous index of an array, circling back to the end after
 *
 * @param {Array} array - the array to cycle through
 * @param {Number} index - the current index
 * @return {Number} - the final index
 */
export function prevIndex(array: any[], index: number) {
  const next = index - 1;
  if (typeof array[next] === 'undefined') return array.length - 1;
  return next;
}
