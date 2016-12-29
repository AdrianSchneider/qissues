import jsYaml from 'js-yaml';

export default class FrontMatterParser {
  private readonly yaml;

  constructor(yaml) {
    this.yaml = yaml;
  }

  public parse(content: string, mainField: string): Object {
    const [metadata, body] = this.split(content);
    try {
      return { ...this.yaml.safeLoad(metadata), [mainField]: body };
    } catch (e) {
      throw new Error('Content metadata is not valid YAML: ' + e.message);
    }
  }

  private split(input: string): string[] {
    const parts = input.split('---');
    if(parts.length != 3) {
      throw new Error('Content requires ---YAML---BODY');
    }

    return parts.slice(-2).map(part => part.trim());
  }

}
