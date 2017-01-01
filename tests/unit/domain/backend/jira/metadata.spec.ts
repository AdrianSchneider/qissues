import * as Promise from 'bluebird';
import { assert }   from 'chai';
import JiraMetadata from '../../../../../src/domain/backend/jira/metadata';
import HttpClient   from '../../../../../src/domain/shared/httpClient';
import User from '../../../../../src/domain/model/meta/user';
import Type from '../../../../../src/domain/model/meta/type';

describe('JIRA Metadata', () => {

  var client: HttpClient;
  var urlMapping: Object;
  var metadata: JiraMetadata;
  const setMockResponse = (url, qs, response) => urlMapping[url] = response;

  beforeEach(() => {
    urlMapping = {};
    client = <HttpClient>{
      get: (url: string, qs?: Object) => {
        if (!qs) qs = {};

        if (typeof urlMapping[url] !== 'undefined') {
          return Promise.resolve(urlMapping[url]);
        }
        throw new Error('unmapped url: ' + url);
      }
    };
    metadata = new JiraMetadata(client);
  });


  describe('#getTypes', () => {
    const url = '/rest/api/2/issue/createmeta';

    it('Promises Types from response', () => {
      setMockResponse(url, {}, { projects: [ { issuetypes: [ { id: 1, name: 'bug' } ] }]});
      return metadata.getTypes().then(types => {
        assert.lengthOf(types, 1);
        assert.instanceOf(types[0], Type);
        assert.equal(types[0].id, '1');
        assert.equal(types[0].name, 'bug');
      });
    });

    it('Removes duplicates from other projects', () => {
      setMockResponse(url, {}, { projects: [ {
        issuetypes: [
          { id: 1, name: 'bug' },
          { id: 2, name: 'feature' },
        ]
      }, {
        issuetypes: [
          { id: 2, name: 'feature' },
          { id: 3, name: 'request' }
        ]
      }]});

      return metadata.getTypes().then(types => assert.deepEqual(
        types.map(type => type.name),
        ['bug', 'feature', 'request']
      ));
    });

  });

  /*
  describe('#getUsers', () => {
    const projectsUrl = '/rest/api/2/issue/createmeta';
    const usersUrl = '/rest/api/2/user/assignable/search';

    it('Returns users from all of the defined projects', () => {
      setMockResponse(projectsUrl, {}, { projects: [
        { key: 'TEST', name: 'Test', id: 1200 }
      ]});

      setMockResponse(usersUrl, [{ name: 'adrian' }]);

      return metadata.getUsers().then(users => {
        assert.lengthOf(users, 1);
        assert.instanceOf(users[0], User);
        assert.equal(users[0].account, 'adrian');
      });
    });

    it('Removes duplicates from other projects', () => {
      setMockResponse(projectsUrl, { projects: [
        { key: 'PROJA', name: 'Project A', id: 1200 },
        { key: 'PROJB', name: 'Project B', id: 1201 },
      ]});

      setMockResponse(usersUrl, [{ name: 'adrian' }], { project: 1200 });
      setMockResponse(usersUrl, [{ name: 'adrian' }, { name: 'joe' }], { project: 1201 });

      return metadata.getUsers().then(users => {
        assert.lengthOf(users, 1);
        assert.equal(users[0].account, 'adrian');
      });
    });

    it('Strips out addon users');

  });
  */

});
