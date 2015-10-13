'use strict';

var expect          = require('chai').expect;
var nodemock        = require('nodemock');
var FrontMatterYaml = require('../../../src/util/frontmatter-yaml');

describe('Frontmatter YAML Parser', function() {

  beforeEach(function() {
    this.yamlParser = nodemock.mock();
    this.parser = new FrontMatterYaml(this.yamlParser);
  });

  describe('#parse', function() {

    it('Throws an error when frontmatter is not well-formed', function() {
      var input = 'a---b';
      var f = function() { this.parser.parse(input, 'description'); }.bind(this);
      expect(f).to.throw(Error, 'Content requires ---');
    });


    it('Throws an error when yaml is invalid', function() {
      var input = '---\nhello mang\n---\ndata';

      this.yamlParser.safeLoad = function() {
        throw new Error('bad yaml');
      };

      var f = function() { this.parser.parse(input, 'description'); }.bind(this);
      expect(f).to.throw(Error, 'not valid YAML');
    });

    it('Returns the parsed content', function() {
      var input = '---\nname: adrian\n---\nhello';

      this.yamlParser
        .mock('safeLoad')
        .takes('name: adrian')
        .returns({ name: 'adrian' });

      var data = this.parser.parse(input, 'message');
      expect(data).to.deep.equal({ name: 'adrian', message: 'hello' });
    });

    it('TODO ignores content that contains ---');

  });

});
