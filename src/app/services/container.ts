import { once, values } from 'underscore'
import * as Promise     from 'bluebird'

export default class Container {
  private registered: DefinitionMap = {};
  private behaviours: BehaviourMap = {};
  private readyServices: Object = {};

  /**
   * Registers a new service in the container
   */
  public registerService(name: string, f: Function, dependencies: string[] = [], behaviours: BehaviourMap = {}) {
    if (this.isRegistered(name)) {
      throw new Error(`Cannot replace existing service ${name}`);
    }

    this.registered[name] = {
      f: once(f),
      behaviours: behaviours,
      dependencies: dependencies
    };
  }

  /**
   * Define a behaviour which can wrap/decorate other services
   */
  public registerBehaviour(name: string, f: (service: any, options: Object, ...deps: any[]) => any, dependencies: string[] = []) {
    if (typeof this.behaviours[name] !== 'undefined') {
      throw new Error(`Cannot replace existing behaviour ${name}`);
    }

    this.behaviours[name] = { name, f, dependencies };
  }

  /**
   * Gets a service from the container
   */
  public get(serviceName: string, satisfying?: string): Promise<any> {
    if (!this.isRegistered(serviceName)) {
      const suffix = satisfying ? ` for ${satisfying}` : '';
      throw new ReferenceError(`Cannot get undefined service ${serviceName}${suffix}`);
    }

    if (typeof this.readyServices[serviceName] !== 'undefined') {
      return Promise.resolve(this.readyServices[serviceName]);
    }

    return this.getServiceFromDefinition(this.registered[serviceName], serviceName)
      .tap(service => this.readyServices[serviceName] = service)
  }

  /**
   * Gets the services after waiting for its dependencies
   */
  private getServiceFromDefinition(definition: Definition, satisfying: string): Promise<any> {
    return Promise
      .map(definition.dependencies, dependency => this.get(dependency, satisfying))
      .then(dependencies => definition.f.apply(definition.f, dependencies))
      .then(service => this.decorateService(service, definition));
  }

  /**
   * Decorates a service before returning it
   */
  private decorateService(service: any, definition: Definition): Promise<any> {
    return Promise.reduce(
      Object.keys(definition.behaviours).map(b => this.behaviours[b]),
      (service: any, behaviour: BehaviourDefinition) => {
        return this.getMatching(behaviour.dependencies).then(dependencies => {
          return behaviour.f(service, definition.behaviours[behaviour.name], ...dependencies);
        });
      },
      service
    );
  }

  /**
   * Gets mutliple services at once
   */
  public getMatching(services: string[]): Promise<Array<any>> {
    return Promise.map(services, name => this.get(name));
  }

  /**
   * Checks to see if a service is registered
   */
  private isRegistered(name: string): Boolean {
    return typeof this.registered[name] !== 'undefined'
  }
}

interface Definition {
  f: Function,
  behaviours: BehaviourMap,
  dependencies: any[]
}

interface DefinitionMap {
  [key: string]: Definition
}

interface BehaviourMap {
  [key: string]: BehaviourDefinition
}
interface BehaviuorConfig {
  [key: string]: Object;
}

interface BehaviourDefinition {
  f: Function,
  dependencies: string[],
  name: string
}
