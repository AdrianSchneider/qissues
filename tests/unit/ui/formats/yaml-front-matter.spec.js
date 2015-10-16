'use strict';

var expect                = require('chai').expect;
var nodemock              = require('nodemock');
var Promise               = require('bluebird');
var Expectations          = require('../../../../src/domain/model/expectations');
var YamlFrontMatterFormat = require('../../../../src/ui/formats/yaml-front-matter');

describe('YAML Front Matter Data Format', function() {

  beforeEach(function() {
    this.parser = nodemock.mock();
    this.yamlParser = nodemock.mock();
    this.format = new YamlFrontMatterFormat(this.parser, this.yamlParser, 'description');
  });

  describe('#seed', function() {

    it('Generates --- yaml --- content', function() {
      var expectations = new Expectations({
        field: { type: 'string' },
        description: { type: 'string' },
      });

      this.yamlParser
        .mock('safeDump')
        .takes({ field: 'value' })
        .returns("field: 'value'\n");

      return this.format.seed(expectations, { field: 'value', description: '' })
        .then(function(template) {
          var parts = template.split('---');
          expect(parts[1]).to.contain("field: 'value'");
          expect(parts).to.have.length(3);
        });
    });

    it('Strips out the content field from the yaml', function() {
      var expectations = new Expectations({
        field: { type: 'string' },
        description: { type: 'string' },
      });

      this.yamlParser
        .mock('safeDump')
        .takes({ field: 'value' })
        .returns("field: 'value'\n");

      return this.format.seed(expectations, { field: 'value', description: '' })
        .then(function(template) {
          expect(template).to.contain("---\nfield: 'value'\n---");
        });
    });

    it('Appends suggestions to fields that contain them', function() {
      var choices = [
        'bug',
        { toString: function() { return 'feature'; } }
      ];

      var expectations = new Expectations({
        type: { type: 'string', choices: Promise.resolve(choices) },
        description: { type: 'string' },
      });

      this.yamlParser
        .mock('safeDump')
        .takes({ type: 'bug' })
        .returns("type: 'bug'\n");

      return this.format.seed(expectations, { type: 'bug', description: '' })
        .then(function(template) {
          expect(template).to.contain("---\ntype: 'bug' # [bug, feature]\n---");
        });
    });

    it('TODO Strips out quotes from empty strings');

  });

  describe('#parse', function() {

    it('Returns the yaml front matter data', function() {
      var data = '---yaml---content---';

      this.parser
        .mock('parse')
        .takes(data, 'description')
        .returns({ description: 'yep' });

      expect(this.format.parse(data)).to.deep.equal({ description: 'yep' });
    });

  });

});
