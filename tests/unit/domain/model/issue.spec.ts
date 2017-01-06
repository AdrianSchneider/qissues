import { assert } from 'chai';
import Id         from "../../../../src/domain/model/id";
import Issue      from "../../../../src/domain/model/issue";
import Label      from "../../../../src/domain/model/meta/label";
import Priority   from "../../../../src/domain/model/meta/priority";
import Project    from "../../../../src/domain/model/meta/project";
import Sprint     from "../../../../src/domain/model/meta/sprint";
import Status     from "../../../../src/domain/model/meta/status";
import Type       from "../../../../src/domain/model/meta/type";
import User       from "../../../../src/domain/model/meta/user";

describe('Issue', () => {

  describe('construction', () => {

    it('Sets the required fields', () => {
      const issue = new Issue(new Id(1), 'title', 'description', new Status('new'));
      assert.deepEqual(issue.id, new Id(1));
      assert.equal(issue.title, 'title');
      assert.equal(issue.description, 'description');
      assert.deepEqual(issue.status, new Status('new'));
    });

    it('Can optionally include a label', () => {
      const label = new Label(1, 'blue');
      const issue = new Issue(new Id(1), 'title', 'description', new Status('new'), { label });
      assert.deepEqual(issue.label, label);
    });

    it('Can optionally include a project', () => {
      const project = new Project('test');
      const issue = new Issue(new Id(1), 'title', 'description', new Status('new'), { project });
      assert.deepEqual(issue.project, project);
    });

    it('Can optionally include a type', () => {
      const type = new Type(1, 'bug');
      const issue = new Issue(new Id(1), 'title', 'description', new Status('new'), { type });
      assert.deepEqual(issue.type, type);
    });

    it('Can optionally include a priority', () => {
      const priority = new Priority(5);
      const issue = new Issue(new Id(1), 'title', 'description', new Status('new'), { priority });
      assert.deepEqual(issue.priority, priority);
    });

    it('Can optionally include a assignee', () => {
      const assignee = new User('joe');
      const issue = new Issue(new Id(1), 'title', 'description', new Status('new'), { assignee });
      assert.deepEqual(issue.assignee, assignee);
    });

    it('Can optionally include a reporter', () => {
      const reporter = new User('joe');
      const issue = new Issue(new Id(1), 'title', 'description', new Status('new'), { reporter });
      assert.deepEqual(issue.reporter, reporter);
    });

    it('Can optionally include a sprint', () => {
      const sprint = new Sprint(100, 'go fast');
      const issue = new Issue(new Id(1), 'title', 'description', new Status('new'), { sprint });
      assert.deepEqual(issue.sprint, sprint);
    });

    it('Can optionally include a create date', () => {
      const dateCreated = new Date();
      const issue = new Issue(new Id(1), 'title', 'description', new Status('new'), { dateCreated });
      assert.deepEqual(issue.dateCreated, dateCreated);
    });

    it('Can optionally include a updated date', () => {
      const dateUpdated = new Date();
      const issue = new Issue(new Id(1), 'title', 'description', new Status('new'), { dateUpdated });
      assert.deepEqual(issue.dateUpdated, dateUpdated);
    });

    it('Can optionally include a comment count', () => {
      const commentCount = 5;
      const issue = new Issue(new Id(1), 'title', 'description', new Status('new'), { commentCount });
      assert.deepEqual(issue.commentCount, commentCount);
    });

  });

});
