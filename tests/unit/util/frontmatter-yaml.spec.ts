import { assert, expect } from 'chai';
import FrontMatterYaml from '../../../src/util/frontmatter-yaml';

describe('Frontmatter YAML Parser', function() {
  var yamlParser;
  var parser;

  beforeEach(() => {
    yamlParser = {};
    parser = new FrontMatterYaml(yamlParser);
  });

  describe('#parse', function() {

    it('Throws an error when frontmatter is not well-formed', () => {
      assert.throws(
        () => parser.parse('', 'description'),
        Error,
        'Content requires ---'
      );
    });

    it('Throws an error when yaml is invalid', function() {
      const input = '---\nhello mang\n---\ndata';
      yamlParser.safeLoad = () => { throw new Error('bad yaml') };

      assert.throws(
        () => parser.parse(input, 'description'),
        Error,
        'not valid YAML'
      );
    });

    it('Returns the parsed content', function() {
      const input = '---\nname: adrian\n---\nhello';

      yamlParser.safeLoad = function(passed: string) {
        assert.equal(passed, 'name: adrian');
        return { name: 'adrian' };
      };

      assert.deepEqual(
        parser.parse(input, 'message'),
        { name: 'adrian', message: 'hello' }
      )
    });

    it('TODO ignores content that contains ---');

  });

});
