import Promise         from 'bluebird';
import { uniq, chain } from 'underscore';
import JiraHttpClient  from './client';
import Cache           from '../../../app/services/cache';
import TrackerMetadata from '../../model/trackerMetadata';
import Expectations    from '../../model/expectations';
import Type            from '../../model/meta/type';
import User            from '../../model/meta/user';
import Sprint          from '../../model/meta/sprint';
import Label           from '../../model/meta/label';
import Priority        from '../../model/meta/priority';
import Status          from '../../model/meta/status';
import Project         from '../../model/meta/project';

export default class JiraMetadata implements TrackerMetadata{

  private client: JiraHttpClient;
  private cache: Cache;
  private ttl: number;

  constructor(client: JiraHttpClient, cache: Cache) {
    this.client = client;
    this.cache = cache;
    this.ttl = 86400;
  }

  /**
   * Fetches the available types in Jira
   *
   * @param {Boolean} invalidate
   * @return {Promise<Array><Type>}
   */
  public getTypes(invalidate: boolean): Promise<Type[]>{
    const cached = this.cache.get('types', invalidate);
    if (cached) return Promise.resolve(cached.map(Type.unserialize));

    return this.client.get('/rest/api/2/issue/createmeta')
      .then(response => {
        return response.projects.map(project => {
          return project.issuetypes.map(type => new Type(type.id, type.name));
        })
      })
      .reduce((types, typesByProject) => uniq(types.concat(typesByProject, false, String)))
      .tap(this.cacheResultsAs('types'));
  }

  public getUsers(invalidate: boolean): Promise<User[]> {
    const cached = this.cache.get('users', invalidate);
    if (cached) return Promise.resolve(cached.map(User.unserialize));

    return this.getProjects()
      .map(project => {
        const opts = { qs: { project: project.getId()} };
        return this.client.get('/rest/api/2/user/assignable/search', opts)
          .then(response => response.map(user => new User(user.name)));
      })
      .reduce((users, usersInProject) => {
        return uniq(users.concat(usersInProject), false, user => user.getAccount());
      }, [])
      .filter(user => user.getAccount().indexOf('addon_') !== 0)
      .tap(this.cacheResultsAs('users'));
  }

  public getViews(invalidate?: boolean): Promise<Object> {
    const cached = this.cache.get('views', invalidate);
    if (cached) return Promise.resolve(cached);

    return this.client.get('/rest/greenhopper/1.0/rapidview')
      .then(response => response.views)
      .tap(this.cacheResultsAs('views'));
  }

  public getSprints(invalidate?: boolean): Promise<Sprint[]> {
    const cached = this.cache.get('sprints', invalidate);
    if (cached) return Promise.resolve(cached.map(Sprint.unserialize));

    return this.getViews()
      .map(view => {
        const opts = { qs: { rapidViewId: view.id } };
        return this.client.get('/rest/greenhopper/1.0/xboard/plan/backlog/data.json', opts)
          .then(response => response.sprints.map(sprint => new Sprint(sprint.id, sprint.name)));
      })
      .reduce((allSprints, sprintsPerView) => allSprints.concat(sprintsPerView), [])
      .tap(this.cacheResultsAs('sprints'));
  }

  public getLabels(invalidate?: boolean): Promise<Label[]> {
    const cached = this.cache.get('labels', invalidate);
    if (cached) return Promise.resolve(cached.map(Label.unserialize));

    return this.client.get('/rest/api/1.0/labels/suggest?query=')
      .then(body => body.suggestions.map(label => new Label(null, label.label)))
      .tap(this.cacheResultsAs('labels'));
  }

  /**
   * Fetches all of the projects the user has access to
   */
  public getProjects(invalidate?: boolean): Promise<Project[]> {
    const cached = this.cache.get('projects', invalidate);
    if (cached) return Promise.resolve(cached.map(Project.unserialize));

    return this.client.get('/rest/api/2/issue/createmeta')
      .then(response => response.projects.map(project => new Project(project.key, project.name, project.id)))
      .tap(this.cacheResultsAs('projects'));
  }

  public getStatuses(invalidate: boolean): Promise<Status[]> {
    const cached = this.cache.get('statuses', invalidate);
    if (cached) return Promise.resolve(cached.map(Status.unserialize));

    return this.metadata.getProjects()
      .map((project) => {
        return this.client.get('/rest/api/2/project/' + project.getInternalId() + '/statuses')
          .reduce((statuses, type) => uniq(statuses.concat(type.statuses), row => row.name), [])
      })
      .reduce((statuses, perProject) => uniq(statuses.concat(perProject), status => status.name), [])
      .map(status => new Status(status.name))
      .tap(this.cacheResultsAs('statuses'));
  }

  public getTransitions(num: string, invalidate: boolean): Promise<JiraTransition[]> {
    const cached = this.cache.get(`transitions:${num}`, invalidate);
    if (cached) return Promise.resolve(cached);

    const opts = { qs: { expand: 'transitions.fields' } };
    return this.client.get('/rest/api/2/issue/' + num + '/transitions', opts)
      .then(response => response.transitions)
      .tap(this.cacheResultsAs(`transitions:${num}`))
  }

  public getIssueTransition(num: string, status: string) {
    return this.metadata.getTransitions(num).then(transitions => {
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

  private cacheResultsAs(name: string): (result) => void {
    return result => this.cache.set(
      name,
      result.map(result => result.serialize ? result.serialize() : result),
      this.ttl
    );
  }

}

interface JiraTransition {
  to: JiraNamedField,
  fields: JiraNamedField[]
}

interface JiraNamedField {
  name: string,
  required: boolean,
  allowedValues: string[]
}
