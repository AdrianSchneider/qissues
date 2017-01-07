import * as Promise   from 'bluebird';
import { assert }     from 'chai';
import MockHttpClient from '../../../../mocks/httpClient';
import JiraMetadata   from '../../../../../src/domain/backend/jira/metadata';
import HttpClient     from '../../../../../src/domain/shared/httpClient';
import User           from '../../../../../src/domain/model/meta/user';
import Type           from '../../../../../src/domain/model/meta/type';
import Sprint         from '../../../../../src/domain/model/meta/sprint';
import Label          from '../../../../../src/domain/model/meta/label';

describe('JIRA Metadata', () => {

  var client: MockHttpClient;
  var urlMapping: Object;
  var metadata: JiraMetadata;

  beforeEach(() => {
    client = new MockHttpClient();
    metadata = new JiraMetadata(client);
  });


  describe('#getTypes', () => {
    const url = '/rest/api/2/issue/createmeta';

    it('Promises Types from response', () => {
      client.mock('get', url, {}, {
        data: { projects: [ { issuetypes: [ { id: 1, name: 'bug' } ] } ] }
      });

      return metadata.getTypes().then(types => {
        assert.lengthOf(types, 1);
        assert.instanceOf(types[0], Type);
        assert.equal(types[0].id, '1');
        assert.equal(types[0].name, 'bug');
      });
    });

    it('Removes duplicates from other projects', () => {
      client.mock('get', url, {}, { data: { projects: [ {
        issuetypes: [
          { id: 1, name: 'bug' },
          { id: 2, name: 'feature' },
        ]
      }, {
        issuetypes: [
          { id: 2, name: 'feature' },
          { id: 3, name: 'request' }
        ]
      }]}});

      return metadata.getTypes().then(types => assert.deepEqual(
        types.map(type => type.name),
        ['bug', 'feature', 'request']
      ));
    });

  });

  describe('#getUsers', () => {
    const projectsUrl = '/rest/api/2/issue/createmeta';
    const usersUrl = '/rest/api/2/user/assignable/search';

    it('Returns users from all of the defined projects', () => {
      client.mock('get', projectsUrl, {}, { data: { projects: [
        { key: 'TEST', name: 'Test', id: 1200 }
      ]}});

      client.mock('get', usersUrl, { project: 'TEST' }, [{ name: 'adrian' }]);

      return metadata.getUsers().then(users => {
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0], User);
        assert.equal(users[0].account, 'adrian');
      });
    });

    it('Removes duplicates from other projects', () => {
      client.mock('get', projectsUrl, {}, { data: { projects: [
        { key: 'PROJA', name: 'Project A', id: 1200 },
        { key: 'PROJB', name: 'Project B', id: 1201 },
      ]}});

      client.mock('get', usersUrl, { project: 'PROJA' }, [{ name: 'adrian' }]);
      client.mock('get', usersUrl, { project: 'PROJB' }, [{ name: 'adrian' }, { name: 'joe' }]);

      return metadata.getUsers().then(users => {
        assert.lengthOf(users, 2);
        assert.deepEqual(users.map(user => user.account), ['adrian', 'joe']);
      });
    });

    it('Strips out addon users', () => {
      client.mock('get', projectsUrl, {}, { data: { projects: [ { key: 'PROJA', name: 'Project A', id: 1200 } ]}});
      client.mock('get', usersUrl, { project: 'PROJA' }, [{ name: 'addon_github' }]);
      return metadata.getUsers().then(users => assert.lengthOf(users, 0));
    });

  });

  describe('#getViews', () => {

    it('Gets all of the views', () => {
      client.mock('get', '/rest/greenhopper/1.0/rapidview', {}, {
        data: { views: [ { id: '100' } ] }
      });

      return metadata.getViews().then(views => assert.deepEqual(
        views,
        [{ id: '100' }]
      ));
    });

  });

  describe('#getSprints', () => {

    it('Gets all of the sprints', () => {
      client.mock('get', '/rest/greenhopper/1.0/rapidview', {}, {
        data: { views: [ { id: '100' } ] }
      });

      client.mock('get', '/rest/greenhopper/1.0/xboard/plan/backlog/data.json', { rapidViewId: '100' }, {
        data: {
          sprints: [
            { id: '1', name: 'Go Fast' }
          ]
        }
      });

      return metadata.getSprints().then(sprints => {
        assert.lengthOf(sprints, 1);
        assert.instanceOf(sprints[0], Sprint);
        assert.equal(sprints[0].id, '1');
        assert.equal(sprints[0].name, 'Go Fast');
      });
    });

    it('Gets sprint from all views and keeps duplicates', () => {
      client.mock('get', '/rest/greenhopper/1.0/rapidview', {}, {
        data: { views: [ { id: '100' }, { id: '101' } ] }
      });

      client.mock('get', '/rest/greenhopper/1.0/xboard/plan/backlog/data.json', { rapidViewId: '100' }, {
        data: {
          sprints: [
            { id: '1', name: 'Go Fast' }
          ]
        }
      });
      client.mock('get', '/rest/greenhopper/1.0/xboard/plan/backlog/data.json', { rapidViewId: '101' }, {
        data: {
          sprints: [
            { id: '11', name: 'Go Fast' },
            { id: '12', name: 'Go Slow' },
          ]
        }
      });

      return metadata.getSprints().then(sprints => assert.lengthOf(sprints, 3));
    });

  });

  describe('#getLabels', () => {

    it('Gets all of the labels', () => {
      client.mock('get', '/rest/api/1.0/labels/suggest?query=', {}, {
        suggestions: [{ label: 'red' }, { label: 'blue' }]
      });

      return metadata.getLabels().then(labels => {
        assert.lengthOf(labels, 2);
        assert.instanceOf(labels[0], Label);
        assert.deepEqual(labels.map(label => label.id), ['', '']);
        assert.deepEqual(labels.map(label => label.name), ['red', 'blue']);
      });
    });

  });

});
