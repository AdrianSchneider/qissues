import * as Promise     from 'bluebird';
import { assert }       from 'chai';
import Id               from '../../../../../src/domain/model/id';
import Issue            from '../../../../../src/domain/model/issue';
import IssuesCollection from '../../../../../src/domain/model/issues';
import NewIssue         from '../../../../../src/domain/model/newIssue';
import Report           from '../../../../../src/domain/model/report';
import JiraRepository   from '../../../../../src/domain/backend/jira/repository';
import HttpClient       from '../../../../../src/domain/shared/httpClient';
import Cache            from '../../../../../src/app/services/cache';

describe('JiraRepository', () => {

  var client: HttpClient;
  var repository: JiraRepository;
  var cache: Cache;
  var normalizer;
  var logger;
  var metadata;

  beforeEach(() => {
    client = <HttpClient>{};
    cache = <Cache>{};
    normalizer = {};
    logger = {};
    repository = new JiraRepository(client, cache, normalizer, metadata, logger);
  });

  describe('#createIssue', () => {

    it('Persists a NewIssue in Jira, promising the new Id', () => {
      const newIssue = <NewIssue>{};
      const newIssueJson = { normalized: true };
      const responseJson = { data: { jira: true } };

      client.post = (url, data) => {
        assert.equal(url, '/rest/api/2/issue');
        assert.deepEqual(data, newIssueJson)
        return Promise.resolve(responseJson);
      };

      normalizer.toNewIssueJson = data => {
        assert.deepEqual(data, newIssue);
        return newIssueJson;
      };

      normalizer.toNum = response => {
        assert.deepEqual(response, responseJson.data);
        return new Id('100');
      };

      return repository.createIssue(newIssue).then(num => {
        assert.instanceOf(num, Id);
        assert.equal(num, '100');
      });

    });

  });

  describe('#lookup', () => {

    it('Looks up the issue, wrapped in cache handlers, promising the found Issue', () => {
      const response = { data: { response: true } };
      const issue = <Issue>{ title: "asdf" };

      client.get = url => {
        assert.equal(url, '/rest/api/2/issue/100');
        return Promise.resolve(response);
      };

      cache.wrap = (key, f, invalidate) => {
        assert.equal(key, 'lookup:100');
        assert.equal(invalidate, false);
        return f();
      };

      normalizer.toIssue = res => {
        assert.deepEqual(res, response.data);
        return issue;
      };

      return repository.lookup(new Id('100'), { invalidate: false })
        .then(createdIssue => assert.deepEqual(createdIssue, issue));
    });

  });

  describe('#query', () => {

    it('Queries the issues, using the generated JQL from the report', () => {
      const jql = 'JQL';
      const issues = <IssuesCollection>{};
      const response = { data: { response: true } };
      const report = <Report>{ filters: { } };

      client.get = (url, qs) => {
        assert.equal(url, '/rest/api/2/search');
        assert.deepEqual(qs, { params: { maxResults: 500, jql: jql } });
        return Promise.resolve(response);
      };

      cache.wrap = (key, f, invalidate) => {
        assert.equal(key, 'issues:JQL');
        assert.equal(invalidate, false);
        return f();
      };

      logger.trace = () => {};
      normalizer.filterSetToJql = f => jql;

      normalizer.toIssuesCollection = r => {
        assert.deepEqual(r, response.data);
        return issues;
      };

      return repository.query(report, { invalidate: false })
        .then(fetchedIssues => assert.deepEqual(fetchedIssues, issues));
    });

  });

});
