import * as _          from 'underscore';
import * as joi        from 'joi';
import * as Promise    from 'bluebird';
import ValidationError from '../errors/validation';

/**
 * Represents some user input expectations
 * Expectations are defined with the SchemaDefinitions (loosely resembling joi schemas)
 * then we can prompt the user for input with those expectations
 * This is used to generate input forms or seed validation
 */
export default class Expectations {

  private schema: SchemaDefinition;
  constructor(schema: SchemaDefinition) {
    this.schema = schema;
  }

  /**
   * Returns a clone of the schema definiton
   */
  public serialize(): SchemaDefinition {
    return { ...this.schema };
  }

  /**
   * Checks to see if this expectation has any rules
   */
  public hasRules(): boolean {
    return Object.keys(this.schema).length > 0;
  }

  /**
   * Gets the entered values merged with the defaults
   */
  public getValues(overrideValues: Object = {}): Promise<Object> {
    return Promise
      .map(
        Object.keys(this.schema),
        fieldName => {
          const field = this.schema[fieldName];
          const value = overrideValues[fieldName] || field.default;

          if (field.matcher && value) {
            return field.matcher(value).then(matched => {
              return [fieldName, matched || value];
            })
          }

          return Promise.resolve([fieldName, value]);
        }
      )
      .reduce((out, [field, value]) => ({ ...out, [field]: value }), {});
  }

  /**
   * Gets the suggestions for the choice fields
   */
  public getSuggestions(): Promise<Array<any>> {
    return Promise
      .filter(Object.keys(this.schema), field => !!this.schema[field].choices)
      .map((field: string) => this.schema[field].choices().then((choices) => ([field, choices.map(String)])));
  }

  /**
   * Ensure the input is valid, otherwise a ValidationError is thrown
   */
  public ensureValid(data: Object): Promise<any> {
    return this.objectSchemaToJoi(this.schema).then((schema) => {
      return this.getValues(data).then(values => {
        var result = joi.validate(values, schema, { stripUnknown: true });
        if (result.error) throw new ValidationError(result.error.message);
        return result.value;
      });
    });
  }

  /**
   * Utility to convert the schema to a joi schema
   */
  private objectSchemaToJoi(schema: SchemaDefinition): Promise<joi.Schema> {
    return Promise
      .map(Object.keys(schema), field => this.fieldSchemaToJoi(field))
      .reduce((out, fs: FieldAndSchema) => {
        out[fs.field] = fs.schema;
        return out;
      }, {})
      .then(fields => joi.object(fields));
  }

  /**
   * Utility to convert a schema field config to a joi field
   */
  private fieldSchemaToJoi(fieldName: string): Promise<FieldAndSchema> {
    const field = this.schema[fieldName];
    let node: joi.Schema = joi[field.type]();

    if (field.required) {
      node = node.required();
    } else {
      node = node.allow('');
    }

    if (field.default)  {
      node = node.default(field.default);
    }

    if (field.choices) {
      return field.choices().then(choices => {
        node = node.valid(choices.map(String));
        return Promise.resolve({ field: fieldName, schema: node });
      });
    }

    return Promise.resolve({ field: fieldName, schema: node });
  }

}

interface SchemaDefinition {
  [key: string]: SchemaFieldDefinition
}

interface SchemaFieldDefinition {
  type: string,
  required: boolean,
  default?: any,
  choices?: () => Promise<string[]>,
  matcher?: (input: string) => Promise<string>
}

interface FieldAndSchema {
  field: string,
  schema: joi.Schema
}
