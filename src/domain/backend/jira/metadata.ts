import { uniq, chain, values } from 'underscore';
import { JiraTransition }      from './types';
import TrackerMetadata         from '../../model/trackerMetadata';
import Expectations            from '../../model/expectations';
import Type                    from '../../model/meta/type';
import User                    from '../../model/meta/user';
import Sprint                  from '../../model/meta/sprint';
import Label                   from '../../model/meta/label';
import Priority                from '../../model/meta/priority';
import Status                  from '../../model/meta/status';
import Project                 from '../../model/meta/project';
import HttpClient              from '../../shared/httpClient';

export default class JiraMetadata implements TrackerMetadata {

  private readonly client: HttpClient;
  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Gets types from JIRA (combine types from all projects)
   */
  public async getTypes(options?): Promise<Type[]>{
    let response = await this.client.get('/rest/api/2/issue/createmeta');

    return response.data.projects
      .map(project => {
        return project.issuetypes.map(type => new Type(type.id, type.name));
      })
      .reduce((types: Type[], typesByProject: Type[]) => {
        return uniq(types.concat(typesByProject), false, String);
      }, []);
  }

  /**
   * Gets users from JIRA (combine users from all projects)
   */
  public async getUsers(options?): Promise<User[]> {
    let projects = await this.getProjects();

    let usersPerProject = await Promise.all(projects.map(async project => {
      let response = await this.client.get(
        '/rest/api/2/user/assignable/search',
        { params: { project: project.id } }
      );

      return response.data.map(user => new User(user.name));
    }));

    return uniq(
      usersPerProject
        .reduce((users, usersInProject) => users.concat(usersInProject), [])
        .filter((user: User) => user.account.indexOf('addon_') !== 0),
      false,
      user => user.account
    );
  }

  /**
   * Get views from JIRA
   */
  public async getViews(options?): Promise<Object[]> {
    let response = await this.client.get('/rest/greenhopper/1.0/rapidview');
    return values(response.data.views);
  }

  /**
   * Get sprints from JIRA (combine sprints from all views)
   */
  public async getSprints(options?): Promise<Sprint[]> {
    let views = await this.getViews();

    let sprintsPerView = await Promise.all(views.map(async view => {
      let response = await this.client.get(`/rest/greenhopper/1.0/sprintquery/${view['id']}`, options);
      return response.data.sprints
        .filter(sprint => sprint.state != 'CLOSED')
        .map(sprint => new Sprint(sprint.id, sprint.name));
    }));

    return sprintsPerView.reduce(
      (sprints, sprintsPerView) => uniq(
        sprints.concat(sprintsPerView), String),
      []
    );
  }

  /**
   * Get labels from JIRA
   */
  public async getLabels(options?): Promise<Label[]> {
    let response = await this.client.get('/rest/api/1.0/labels/suggest?query=');
    return response.data.suggestions.map(
      label => new Label(null, label.label)
    );
  }

  /**
   * Gets projects from JIRA
   */
  public async getProjects(options?): Promise<Project[]> {
    let response = await this.client.get('/rest/api/2/issue/createmeta');
    return response.data.projects.map(
      project => new Project(project.key, project.name, project.id)
    );
  }

  /**
   * Gets statuses from JIRA (combine statuses from all projects)
   */
  public async getStatuses(options?): Promise<Status[]> {
    let projects = await this.getProjects();

    let statusesPerProject = await Promise.all(projects.map(async project => {
      let response = await this.client.get(`/rest/api/2/project/${project.internalId}/statuses`);
      return response.data.reduce(
        (statuses, type) => uniq(
          statuses.concat(type['statuses']),
          row => row.name
        ),
        []
      );
    }));

    return statusesPerProject
      .reduce(
        (statuses, perProject) => uniq(
          statuses.concat(perProject),
          status => status.name
        ),
        []
      )
      .map(status => new Status(status['name']));
  }

  /**
   * Get transitions from JIRA for a given issue
   */
  public async getTransitions(num: string): Promise<JiraTransition[]> {
    const opts = { qs: { expand: 'transitions.fields' } };
    let response = await this.client.get('/rest/api/2/issue/' + num + '/transitions', opts)
    return response.transitions;
  }

  /**
   * Gets transitions for JIRA for a given issue that is valid for a current status
   */
  public async getIssueTransition(num: string, status: string) {
    let transitions = await this.getTransitions(num);

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
