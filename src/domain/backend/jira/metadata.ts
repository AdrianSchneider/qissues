import * as Promise       from 'bluebird';
import { uniq, chain }    from 'underscore';
import * as fallback      from 'promise-fallback';
import { JiraTransition } from './types';
import TrackerMetadata    from '../../model/trackerMetadata';
import Expectations       from '../../model/expectations';
import Type               from '../../model/meta/type';
import User               from '../../model/meta/user';
import Sprint             from '../../model/meta/sprint';
import Label              from '../../model/meta/label';
import Priority           from '../../model/meta/priority';
import Status             from '../../model/meta/status';
import Project            from '../../model/meta/project';
import HttpClient         from '../../shared/httpClient';

export default class JiraMetadata implements TrackerMetadata {

  private readonly client: HttpClient;
  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Gets types from JIRA (combine types from all projects)
   */
  public getTypes(options?): Promise<Type[]>{
    return this.client.get('/rest/api/2/issue/createmeta')
      .then(response => response.data)
      .then(response => {
        return response.projects.map(project => {
          return project.issuetypes.map(type => new Type(type.id, type.name));
        })
      })
      .reduce((types: Type[], typesByProject: Type[]) => {
        return uniq(types.concat(typesByProject), false, String);
      }, []);
  }

  /**
   * Gets users from JIRA (combine users from all projects)
   */
  public getUsers(options?): Promise<User[]> {
    return this.getProjects()
      .map((project: Project) => {
        return this.client.get('/rest/api/2/user/assignable/search', { params: { project: project.id } })
          .then(r => r.data)
          .then(response => response.map(user => new User(user.name)));
      })
      .reduce((users, usersInProject) => {
        return uniq(users.concat(usersInProject), false, user => user.account)
      }, [])
      .filter((user: User) => user.account.indexOf('addon_') !== 0);
  }

  /**
   * Get views from JIRA
   */
  public getViews(options?): Promise<Object> {
    return this.client.get('/rest/greenhopper/1.0/rapidview')
      .then(response => response.data)
      .then(response => response.views)
  }

  /**
   * Get sprints from JIRA (combine sprints from all views)
   */
  public getSprints(options?): Promise<Sprint[]> {
    return this.getViews()
      .map(view => {
        const opts = { params: { rapidViewId: view['id'] } };
        return this.client.get('/rest/greenhopper/1.0/xboard/plan/backlog/data.json', opts)
          .then(response => response.data)
          .then(response => response.sprints.map(sprint => new Sprint(sprint.id, sprint.name)))
          .catch(e => ([]))
      })
      .reduce((allSprints, sprintsPerView) => allSprints.concat(sprintsPerView), [])
  }

  /**
   * Get labels from JIRA
   */
  public getLabels(options?): Promise<Label[]> {
    return this.client.get('/rest/api/1.0/labels/suggest?query=')
      .then(response => response.data)
      .then(body => body.suggestions.map(label => new Label(null, label.label)))
  }

  /**
   * Gets projects from JIRA
   */
  public getProjects(options?): Promise<Project[]> {
    return this.client.get('/rest/api/2/issue/createmeta')
      .then(response => response.data)
      .then(response => response.projects.map(
        project => new Project(project.key, project.name, project.id)
      ))
  }

  /**
   * Gets statuses from JIRA (combine statuses from all projects)
   */
  public getStatuses(options?): Promise<Status[]> {
    return this.getProjects()
      .map((project: Project) => {
        return this.client.get(`/rest/api/2/project/${project.internalId}/statuses`)
          .then(response => response.data)
          .reduce((statuses, type) => uniq(statuses.concat(type['statuses']), row => row.name), [])
      })
      .reduce((statuses, perProject) => uniq(statuses.concat(perProject), status => status.name), [])
      .map(status => new Status(status['name']))
  }

  /**
   * Get transitions from JIRA for a given issue
   */
  public getTransitions(num: string): Promise<JiraTransition[]> {
    const opts = { qs: { expand: 'transitions.fields' } };
    return this.client.get('/rest/api/2/issue/' + num + '/transitions', opts)
      .then(response => response.transitions)
  }

  /**
   * Gets transitions for JIRA for a given issue that is valid for a current status
   */
  public getIssueTransition(num: string, status: string) {
    return this.getTransitions(num).then(transitions => {
      const transition: JiraTransition = transitions.find(transition => {
        return transition.to.name.toLowerCase() === status.toLowerCase();
      });

      if (!transition) throw new Error('Could not find transition for ' + status);
      return transition;
    });
  }

  /**
   * Gets the expectations for an issue transition
   */
  public transitionToExpectations(transition: JiraTransition): Expectations {
    return new Expectations(
      chain(transition.fields)
        .keys()
        .map(field => ({
          field: field,
          type: 'string',
          required: transition.fields[field].required,
          default: null,
          choices: Promise.resolve(transition.fields[field].allowedValues)
        }))
        .filter(field => field.required)
        .map(field => ({ ...field, choices: field.choices.map(f => f.name) }))
        .indexBy('field')
        .value()
    );
  }
}
