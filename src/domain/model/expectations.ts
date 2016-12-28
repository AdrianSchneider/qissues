import * as _          from 'underscore';
import * as joi        from 'joi';
import * as Promise    from 'bluebird';
import ValidationError from '../errors/validation';

interface SchemaDefinition {
  [key: string]: SchemaFieldDefinition
}

interface SchemaFieldDefinition {
  type: string,
  required: boolean,
  default: any,
  choices?: Promise<string[]>
}

export default class Expectations {

  private schema: SchemaDefinition;

  constructor(schema: SchemaDefinition) {
    this.schema = schema;
  }

  public serialize(): SchemaDefinition {
    return this.schema;
  }

  public hasRules(): boolean {
    return Object.keys(this.schema).length > 0;
  }

  public getValues(overrideValues: Object): Object {
    if (!overrideValues) overrideValues = {};
    return _.mapObject(this.schema, (field, key) => {
      return overrideValues[key] || field.default;
    });
  }

  public getSuggestions(): Promise<array> {
    return Promise
      .filter(Object.keys(this.schema), field => {
        return !!this.schema[field].choices;
      })
      .map(field => this.schema[field].choices.then((choices) => {
        return [field, choices];
      }));
  }

  public ensureValid(data: Object) {
    return this.objectSchemaToJoi(this.schema).then((schema) => {
      var result = joi.validate(data, schema, { stripUnknown: true });
      if (result.error) throw new ValidationError(result.error.message);
      return result.value;
    });
  }

  private objectSchemaToJoi(schema) {
    return Promise
      .map(Object.keys(schema), field => this.fieldSchemaToJoi(field))
      .reduce((out, [key, value]) => {
        out[key] = value;
        return out;
      }, {})
      .then(fields => joi.object(fields));
  }

  private fieldSchemaToJoi(fieldName: string): [string, Object] {
    const field = this.schema[fieldName];
    let node = joi[field.type]();

    if (field.required) {
      node = node.required();
    } else {
      node = node.allow('');
    }

    if (field.default)  {
      node = node.default(field.default);
    }

    if (field.choices) {
      return field.choices.then((choices) => {
        node = node.valid(choices.map(String));
        return [fieldName, node];
      });
    }

    return [fieldName, node];
  }

}
