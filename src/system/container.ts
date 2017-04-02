import { once, values } from 'underscore'

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
  public async get(serviceName: string, satisfying?: string): Promise<any> {
    if (!this.isRegistered(serviceName)) {
      const suffix = satisfying ? ` for ${satisfying}` : '';
      throw new ReferenceError(`Cannot get undefined service ${serviceName}${suffix}`);
    }

    if (typeof this.readyServices[serviceName] !== 'undefined') {
      return await this.readyServices[serviceName];
    }

    let service = await this.getServiceFromDefinition(this.registered[serviceName], serviceName);
    this.readyServices[serviceName] = service;
    return service;
  }

  /**
   * Gets the services after waiting for its dependencies
   */
  private async getServiceFromDefinition(definition: Definition, satisfying: string): Promise<any> {
    let resolvedDependencies = await Promise.all(
      definition.dependencies.map(async dependency => this.get(dependency, satisfying))
    );

    let dependency = await definition.f.apply(definition.f, resolvedDependencies);

    return this.decorateService(dependency, definition);
  }

  /**
   * Decorates a service before returning it
   */
  private async decorateService(service: any, definition: Definition): Promise<any> {
    let decoratedService = service;
    await Promise.all(
      Object.keys(definition.behaviours)
        .map(b => this.behaviours[b])
        .map(async behaviour => {
          let dependencies = await this.getMatching(behaviour.dependencies);
          decoratedService = behaviour.f(service, definition.behaviours[behaviour.name], ...dependencies);
        })
    );
    return decoratedService;
  }

  /**
   * Gets mutliple services at once
   */
  public async getMatching(services: string[]): Promise<Array<any>> {
    return Promise.all(
      services.map(async name => this.get(name))
    );
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
