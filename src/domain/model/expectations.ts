import * as _          from 'underscore';
import * as joi        from 'joi';
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
  public async getValues(overrideValues: Object = {}): Promise<Object> {
    const results = await Promise.all(Object.keys(this.schema).map(async fieldName => {
      const field = this.schema[fieldName];
      const value = overrideValues[fieldName] || field.default;

      if (field.matcher && value) {
        const matched = await field.matcher(value);
        return [fieldName, matched || value];
      }

      return [fieldName, value];
    }));

    return results.reduce(
      (out, [field, value]) => ({ ...out, [field]: value }),
      {}
    );
  }

  /**
   * Gets the suggestions for the choice fields
   */
  public getSuggestions(): Promise<Array<any>> {
    return Promise.all(
      Object.keys(this.schema)
        .filter(field => !!this.schema[field].choices)
        .map(async field => {
          const choices = await this.schema[field].choices();
          return [field, choices.map(String)];
        })
    );
  }

  /**
   * Ensure the input is valid, otherwise a ValidationError is thrown
   */
  public async ensureValid(data: Object): Promise<any> {
    const schema = await this.objectSchemaToJoi(this.schema);
    const result = joi.validate(await this.getValues(data), schema, { stripUnknown: true });

    if (result.error) throw new ValidationError(result.error.message);
    return result.value;
  }

  /**
   * Utility to convert the schema to a joi schema
   */
  private async objectSchemaToJoi(schema: SchemaDefinition): Promise<joi.Schema> {
    const fields = await Promise.all(
      Object.keys(schema).map(async field => await this.fieldSchemaToJoi(field))
    );

    return joi.object(
      fields.reduce((out, fs) => ({ ...out, [fs.field]: fs.schema }), {})
    );
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
