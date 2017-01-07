import { assert }         from 'chai';
import ExternallyViewable from '../../../../src/ui/behaviors/externallyViewable';
import Browser            from '../../../../src/ui/services/browser';
import TrackerNormalizer  from '../../../../src/domain/model/trackerNormalizer';
import Id                 from '../../../../src/domain/model/id';
import FilterSet          from '../../../../src/domain/model/filterSet';
import Issue              from '../../../../src/domain/model/issue';
import IssuesCollection   from '../../../../src/domain/model/issues';
import HasIssues          from '../../../../src/ui/views/hasIssues';

describe('Externally Viewable Behaviour', () => {

  var behaviour: ExternallyViewable;
  var browser: Browser;
  var normalizer: TrackerNormalizer;
  beforeEach(() => {
    browser = <Browser>{};
    normalizer = <TrackerNormalizer>{};
    behaviour = new ExternallyViewable(browser, normalizer);
  });

  it('Listens to the configured keystroke', () => {
    const node = { key: (key, cb) => { assert.equal(key, 'b'); } };
    const view = <HasIssues>{ node: node };

    behaviour.attach(view, {
      keys: { open: 'b' },
      getFilters: () => new FilterSet([])
    });
  });

  it('Configured key opens browser to issues page', () => {
    var keyCallback: Function;
    const node = { key: (key, cb) => { keyCallback = cb; } };
    const view = <HasIssues>{ node: node };
    const filters = new FilterSet([]);

    behaviour.attach(view, {
      keys: { open: 'b' },
      getFilters: () => filters
    });

    view.getIssues = () => new IssuesCollection([]);

    normalizer.getQueryUrl = filterset => {
      assert.deepEqual(filterset, filters);
      return '/path/to/query';
    }

    browser.open = url => assert.equal(url, '/path/to/query');

    keyCallback();
  });

  it('Configured key opens browser to single issue page when only one issue is shown', () => {
    var keyCallback: Function;
    const node = { key: (key, cb) => { keyCallback = cb; } };
    const view = <HasIssues>{ node: node };
    const filters = new FilterSet([]);
    const issue = <Issue>{ id: new Id('1') };
    const issues = new IssuesCollection([issue]);

    behaviour.attach(view, {
      keys: { open: 'b' },
      getFilters: () => filters
    });

    view.getIssue = () => issue;
    view.getIssues = () => issues;

    normalizer.getIssueUrl = (id, filterset) => {
      assert.deepEqual(id, issue.id);
      assert.deepEqual(filterset, filters);
      return `/path/to/${id}`;
    }

    browser.open = url => assert.equal(url, '/path/to/1');

    keyCallback();
  });

  it('Cannot attach to another view', () => {
    const node = { key: (key, cb) => { assert.equal(key, 'b'); } };
    const view = <HasIssues>{ node: node };

    behaviour.attach(view, {
      keys: { open: 'b' },
      getFilters: () => new FilterSet([])
    });

    assert.throws(() => {
      behaviour.attach(view, {
        keys: { open: 'b' },
        getFilters: () => new FilterSet([])
      });
    }, Error, 'Already');
  });

});
