import wordwrap from 'wordwrap';

/**
 * Indents a string on each line, while also wrapping words
 * The need for this goes away when we can wrap each item in a proper box
 *
 * @param {String} text
 * @param {Number} level - indentation level
 * @param {Number} maxWidth - size of container
 */
export default function wrap(text: string, level: number, maxWidth: number): string {
  const spacer = '    ';
  const indent = spacer.repeat(level);

  return text
    .split('\n')
    .map(line => wordwrap(maxWidth - (level * spacer.length))(line))
    .join('\n').split('\n')
    .map(line => indent + line)
    .join('\n');
};
