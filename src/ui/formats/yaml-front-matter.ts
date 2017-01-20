'use strict';

import { omit }   from 'underscore';
import { format } from 'util';

export default class YamlFrontMatterFormat {
  private readonly parser;
  private readonly yamlParser;
  private readonly contentField: string;

  constructor(parser, yamlParser, contentField?: string) {
    this.parser = parser;
    this.yamlParser = yamlParser;
    this.contentField = contentField || 'description';
  }

  /**
   * Seeds a YAML front-matter document with data
   *
   * @param {Object}     data
   * @param {Joi.Schema} schema
   * @return {Promise<String>}
   */
  public seed(expectations, values: Object, draft: string, error?: Error): Promise<string> {
    if (draft) return Promise.resolve(this.prependErrorToContent(error, draft));

    return expectations.getValues(values).then(data => {
      let template = format(
        "---\n%s---\n%s",
        this.buildYaml(data),
        data[this.contentField] || ""
      );

      return expectations.getSuggestions()
        .then(suggestions => {
          suggestions.forEach(([field, choices]) => {
            template = template.split('\n').map(line => {
              if(line.indexOf(field) === 0) {
                line += ' # [' + choices.map(String).join(', ') + ']';
              }
              return line;
            }).join('\n');
          });
          return template;
        });
    });
  }

  /**
   * Prepends an error message to the content for the user to edit
   *
   * @param {Error} error
   * @param {String} content
   */
  private prependErrorToContent(error: Error, content: string) {
    const pos = content.indexOf('---');
    return format(
      '# Error: %s\n%s',
      error.message,
      typeof pos !== 'undefined' ? content.substr(pos) : content
    );
  }

  /**
   * Parses data from a YAML front-matter document
   *
   * @param {String} str - input
   * @return {Object}
   */
  public parse(content: string): Object {
    return this.parser.parse(content, this.contentField);
  }

  /**
   * Serialize an object into safe YAML
   *
   * @param {Object} object
   * @return {String}
   */
  private buildYaml(data: Object): string {
    return this.yamlParser.safeDump(omit(data, this.contentField));
  }
}
