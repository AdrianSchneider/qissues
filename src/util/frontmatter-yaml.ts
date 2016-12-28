import jsYaml from 'js-yaml';

export default class FrontMatterParser {
  private readonly yaml;

  constructor(yaml) {
    this.yaml = yaml;
  }

  /**
   * Takes a front-matter yaml string and
   * returns an object of data
   *
   * @param {String} content
   * @param {String} mainField - for body
   * @return {Object}
   */
  public parse(content: string, mainField: string): Object {
    const [metadata, body] = this.split(content);
    try {
      return { ...this.yaml.safeLoad(metadata), [mainField]: body };
    } catch (e) {
      throw new Error('Content metadata is not valid YAML: ' + e.message);
    }
  }

  /**
   * Separate the YAML from the main body
   *
   * @param {String} Input
   * @return {Array<String>} (yaml, body)
   */
  private split(input: string): string[] {
    const parts = input.split('---');
    if(parts.length != 3) {
      throw new Error('Content requires ---YAML---BODY');
    }

    return parts.slice(-2).map(part => part.trim());
  }

}
