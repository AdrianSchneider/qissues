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

export default class JiraMetadata implements TrackerMetadata{

  private readonly client: HttpClient;
  constructor(client: HttpClient) {
    this.client = client;
  }

  public getTypes(): Promise<Type[]>{
    return this.client.get('/rest/api/2/issue/createmeta')
      .then(response => {
        return response.projects.map(project => {
          return project.issuetypes.map(type => new Type(type.id, type.name));
        })
      })
      .reduce((types, typesByProject) => uniq(types.concat(typesByProject), false, String))
  }

  public getUsers(): Promise<User[]> {
    return this.getProjects()
      .map((project: Project) => {
        const opts = { qs: { project: project.id } };
        return this.client.get('/rest/api/2/user/assignable/search', opts)
          .then(response => response.map(user => new User(user.name)));
      })
      .reduce((users, usersInProject) => {
        return uniq(users.concat(usersInProject), false, user => user.account)
      }, [])
      .filter(user => user.account.indexOf('addon_') !== 0);
  }

  public getViews(): Promise<Object> {
    return this.client.get('/rest/greenhopper/1.0/rapidview')
      .then(response => response.views)
  }

  public getSprints(): Promise<Sprint[]> {
    return this.getViews()
      .map(view => {
        const opts = { qs: { rapidViewId: view.id } };
        return this.client.get('/rest/greenhopper/1.0/xboard/plan/backlog/data.json', opts)
          .then(response => response.sprints.map(sprint => new Sprint(sprint.id, sprint.name)));
      })
      .reduce((allSprints, sprintsPerView) => allSprints.concat(sprintsPerView), [])
  }

  public getLabels(): Promise<Label[]> {
    return this.client.get('/rest/api/1.0/labels/suggest?query=')
      .then(body => body.suggestions.map(label => new Label(null, label.label)))
  }

  public getProjects(): Promise<Project[]> {
    return this.client.get('/rest/api/2/issue/createmeta')
      .then(response => response.projects.map(
        project => new Project(project.key, project.name, project.id)
      ))
  }

  public getStatuses(): Promise<Status[]> {
    return this.getProjects()
      .map((project: Project) => {
        return this.client.get(`/rest/api/2/project/${project.internalId}/statuses`)
          .reduce((statuses, type) => uniq(statuses.concat(type.statuses), row => row.name), [])
      })
      .reduce((statuses, perProject) => uniq(statuses.concat(perProject), status => status.name), [])
      .map(status => new Status(status.name))
  }

  public getTransitions(num: string): Promise<JiraTransition[]> {
    const opts = { qs: { expand: 'transitions.fields' } };
    return this.client.get('/rest/api/2/issue/' + num + '/transitions', opts)
      .then(response => response.transitions)
  }

  public getIssueTransition(num: string, status: string) {
    return this.getTransitions(num).then(transitions => {
      const transition: JiraTransition = transitions.find(transition => {
        return transition.to.name.toLowerCase() === status.toLowerCase();
      });

      if (!transition) throw new Error('Could not find transition for ' + status);
      return transition;
    });
  }

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
        .vlaue()
    );
  }
}
