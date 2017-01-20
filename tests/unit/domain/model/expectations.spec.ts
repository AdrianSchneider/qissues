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
      return expectations.getValues({ title: 'sup' })
        .then(values => assert.deepEqual(
          values,
          { title: 'sup' }
        ));
    });

    it('Falls back to defaults when nothing is entered', () => {
      const expectations = new Expectations({
        title: { type: 'string', required: true },
        description: { type: 'string', required: false, default: "placeholder text" }
      });

      return expectations.getValues({ title: 'sup' })
        .then(values => assert.deepEqual(
          values,
          { title: 'sup', description: 'placeholder text' }
        ));
    });

    it('Transforms matched choices', () => {
      const input = 'LBT';
      const choices = ['Land Before Time'];

      const expectations = new Expectations({
        title: {
          type: 'string',
          required: true,
          choices: () => Promise.resolve(choices),
          matcher: text => {
            if (text === input) return Promise.resolve(choices[0]);
            return Promise.resolve(null);
          }
        }
      });

      return expectations.getValues({ title: input })
        .then(values => assert.deepEqual(
          values,
          { title: 'Land Before Time' }
        ));
    });

    it('Non-matched choices remain as-is', () => {
      const input = 'LBT';
      const choices = ['Land Before Time'];

      const expectations = new Expectations({
        title: {
          type: 'string',
          required: true,
          choices: () => Promise.resolve(choices),
          matcher: text => {
            if (text === input) return Promise.resolve(choices[0]);
            return Promise.resolve(null);
          }
        }
      });

      return expectations.getValues({ title: 'wrong value' })
        .then(values => assert.deepEqual(
          values,
          { title: 'wrong value' }
        ));
    });

  });

  describe('#getSuggestions', () => {

    it('Strips out fields without any choices', () => {
      const expectations = new Expectations({ title: { type: 'string', required: true } });
      return expectations.getSuggestions().then(suggestions => assert.deepEqual(suggestions, []));
    });

    it('Lists all fields and their choices', () => {
      const expectations = new Expectations({
        author: { type: 'string', required: true, choices: () => Promise.resolve(['adrian', 'bob']) }
      });

      return expectations.getSuggestions().then(suggestions => assert.deepEqual(
        suggestions,
        [["author", ["adrian", "bob"]]]
      ));
    });

  });

  describe('#ensureValid', () => {

    it('Passes when all required fields match', () => {
      const expectations = new Expectations({ title: { type: 'string', required: true } });
      return expectations.ensureValid({ title: 'hello' });
    });

    it('Fails when required fields are missing', () => {
      const expectations = new Expectations({ title: { type: 'string', required: true } });
      return expectations.ensureValid({ title: '' })
        .catch(ValidationError, e => assert.include(e.message, 'title'));
    });

    it('Passes when using a preselected choice', () => {
      const choices = Promise.resolve(['adrian']);
      const expectations = new Expectations({ title: { type: 'string', required: true, choices: () => choices } });
      return expectations.ensureValid({ title: 'adrian' });
    });

    it('Fails when not using a preselected choice', () => {
      const choices = Promise.resolve(['adrian']);
      const expectations = new Expectations({ title: { type: 'string', required: true, choices: () => choices } });
      return expectations.ensureValid({ title: 'dude' })
        .catch(ValidationError, e => assert.include(e.message, 'must be one of'));
    });

    it('Fails when not using a preselected choice', () => {
      const choices = Promise.resolve(['adrian', 'joe']);
      const expectations = new Expectations({ title: { type: 'string', required: true, choices: () => choices } });
      return expectations.ensureValid({ title: 'dude' })
        .catch(ValidationError, e => assert.include(e.message, 'must be one of'));
    });

    it('Expands matched fields within validity checks', () => {
      const abbrev = 'adr';
      const choices = ['adrian', 'joe'];
      const expectations = new Expectations({
        user: {
          type: 'string',
          required: true,
          choices: () => Promise.resolve(choices),
          matcher: input => {
            if (input === abbrev) return Promise.resolve(choices[0]);
            return Promise.resolve(input);
          }
        }
      });

      return expectations.ensureValid({ user: 'adr' });
    });

    it('Doesnt expand non-matching fields', () => {
      const abbrev = 'adr';
      const choices = ['adrian', 'joe'];
      const expectations = new Expectations({
        user: {
          type: 'string',
          required: true,
          choices: () => Promise.resolve(choices),
          matcher: input => {
            if (input === abbrev) return Promise.resolve(choices[0]);
            return Promise.resolve(input);
          }
        }
      });

      return expectations.ensureValid({ user: 'jo' })
        .catch(ValidationError, e => assert.include(e.message, 'must be one of'));
    });

  });

});
