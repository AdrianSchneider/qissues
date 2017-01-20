import { assert }      from 'chai';
import * as Promise    from 'bluebird';
import Project         from '../../../../src/domain/model/meta/project';
import Type            from '../../../../src/domain/model/meta/type';
import User            from '../../../../src/domain/model/meta/user';
import Sprint          from '../../../../src/domain/model/meta/sprint';
import Metadata        from '../../../../src/domain/model/trackerMetadata';
import MetadataMatcher from '../../../../src/domain/model/metadataMatcher';

describe('Metadata Matcher', () => {

  var metadata: Metadata;
  var matcher: MetadataMatcher;
  beforeEach(() => {
    metadata = <Metadata>{};
    matcher = new MetadataMatcher(metadata);
  });

  describe('#matching', () => {

    it('Is case insensitive', () => {
      metadata.getProjects = (opts?) => Promise.resolve([<Project>{ id: "QI" }]);
      return matcher.matchProject('qi').then(project => assert.equal(project.id, 'QI'));
    });

    it('Throws an error when results are ambiguous', () => {
      metadata.getProjects = (opts?) => Promise.resolve([
        <Project>{ id: "qissues1", toString: () => 'qissues1' },
        <Project>{ id: "qissues2", toString: () => 'qissues2' }
      ]);

      return matcher.matchProject('qissues')
        .then(() => { throw new Error('fail'); })
        .catch(error => assert.equal(
          error.message,
          'project of qissues is ambiguous; did you want qissues1 or qissues2?'
        ));
    });
  });

  describe('#matchProject', () => {

    it('Matches on id', () => {
      const project = <Project>{ id: "qi", toString: () => 'qi' };
      metadata.getProjects = (opts?) => Promise.resolve([project]);
      return matcher.matchProject('qi')
        .then(matched => assert.deepEqual(matched, project));
    });

    it('Matches on names', () => {
      const project = <Project>{ id: "qi", name: "my app", toString: () => 'qi' };
      metadata.getProjects = (opts?) => Promise.resolve([project]);
      return matcher.matchProject('my app')
        .then(matched => assert.deepEqual(matched, project));
    });

  });

  describe('#matchUser', () => {

    it('Matches on account', () => {
      const user = <User>{ account: "adrian", toString: () => "adrian" };
      metadata.getUsers = (opts?) => Promise.resolve([user]);
      return matcher.matchUser('adrian')
        .then(matched => assert.deepEqual(matched, user));
    });

    it('Matches on name', () => {
      const user = <User>{ name: "adrian", toString: () => "adrian" };
      metadata.getUsers = (opts?) => Promise.resolve([user]);
      return matcher.matchUser('adrian')
        .then(matched => assert.deepEqual(matched, user));
    });

  });

  describe('#matchType', () => {

    it('Matches on name', () => {
      const type = <Type>{ name: "bug", toString: () => "bug" };
      metadata.getTypes = (opts?) => Promise.resolve([type]);
      return matcher.matchType('bug')
        .then(matched => assert.deepEqual(matched, type));
    });

  });

  describe('#matchSprint', () => {

    it('Matches on name', () => {
      const sprint = <Sprint>{ name: "faster", toString: () => "faster" };
      metadata.getSprints = (opts?) => Promise.resolve([sprint]);
      return matcher.matchSprint('faster')
        .then(matched => assert.deepEqual(matched, sprint));
    });

  });

});
