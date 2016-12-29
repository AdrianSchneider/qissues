import { assert }      from 'chai';
import * as Promise    from 'bluebird';
import ValidationError from '../../../../src/domain/errors/validation';
import Expectations    from '../../../../src/domain/model/expectations';

describe('Expectations', () => {

  describe('#serialize', () => {

    it('Returns the schema', () => {
      const expectations = new Expectations({ title: { type: 'string', required: true } });
      assert.deepEqual(
        expectations.serialize(),
        { title: { type: 'string', required: true } }
      );
    });

    it('Clones the schema to prevent mutation', () => {
      const expectations = new Expectations({ title: { type: 'string', required: true } });
      const serialized = expectations.serialize();
      delete serialized['title'];

      assert.notDeepEqual(
        expectations.serialize(),
        serialized
      );
    });

  });

  describe('#hasRules', () => {

    it('Returns true when fields are defined', () => {
      const expectations = new Expectations({ title: { type: 'string', required: true } });
      assert.equal(expectations.hasRules(), true);
    });

    it('Returns false when no fields are defined', () => {
      const expectations = new Expectations({});
      assert.equal(expectations.hasRules(), false);
    });

  });

  describe('#getValues', () => {

    it('Gets the passed in values', () => {
      const expectations = new Expectations({ title: { type: 'string', required: true } });
      assert.deepEqual(
        expectations.getValues({ title: "sup" }),
        { title: "sup" }
      );
    });

    it('Falls back to defaults when nothing is entered', () => {
      const expectations = new Expectations({
        title: { type: 'string', required: true },
        description: { type: 'string', required: false, default: "placeholder text" }
      });

      assert.deepEqual(
        expectations.getValues({ title: 'sup' }),
        { title: 'sup', description: 'placeholder text' }
      );
    });

  });

  describe('#getSuggestions', function() {

    it('Strips out fields without any choices', () => {
      const expectations = new Expectations({ title: { type: 'string', required: true } });
      return expectations.getSuggestions().then(suggestions => assert.deepEqual(suggestions, []));
    });

    it('Lists all fields and their choices', () => {
      const expectations = new Expectations({
        author: { type: 'string', required: true, choices: Promise.resolve(['adrian', 'bob']) }
      });

      return expectations.getSuggestions().then(suggestions => assert.deepEqual(
        suggestions,
        [["author", ["adrian", "bob"]]]
      ));
    });

  });

  describe('#ensureValid', function() {
    it('Passes when all required fields match', function() {
      const expectations = new Expectations({ title: { type: 'string', required: true } });
      return expectations.ensureValid({ title: 'hello' });
    });

    it('Fails when required fields are missing', function() {
      const expectations = new Expectations({ title: { type: 'string', required: true } });
      return expectations.ensureValid({ title: '' })
        .catch(ValidationError, e => assert.include(e.message, 'title'));
    });

    it('Passes when using a preselected choice', function() {
      const choices = Promise.resolve(['adrian']);
      const expectations = new Expectations({ title: { type: 'string', required: true, choices: choices } });
      return expectations.ensureValid({ title: 'adrian' });
    });

    it('Fails when not using a preselected choice', function() {
      const choices = Promise.resolve(['adrian']);
      const expectations = new Expectations({ title: { type: 'string', required: true, choices: choices } });
      return expectations.ensureValid({ title: 'dude' })
        .catch(ValidationError, e => assert.include(e.message, 'must be one of'));
    });

    it('Fails when not using a preselected choice', function() {
      const choices = Promise.resolve(['adrian', 'joe']);
      const expectations = new Expectations({ title: { type: 'string', required: true, choices: choices } });
      return expectations.ensureValid({ title: 'dude' })
        .catch(ValidationError, e => assert.include(e.message, 'must be one of'));
    });

  });

});
