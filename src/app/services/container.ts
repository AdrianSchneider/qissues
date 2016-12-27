import { once }      from 'underscore'
import * as BPromise from 'bluebird'

interface Definition {
  f: Function,
  dependencies: Array<any>
}

interface DefinitionMap {
  [key: string]: Definition
}

export default class Container {
  private registered: DefinitionMap = {};
  private readyServices: Object = {};

  /**
   * Registers a new service in the container
   *
   * @param name the name of the service
   * @param f the function returning the service
   * @param depenencies the services this service depends on
   */
  public registerService(name: string, f: Function, dependencies?: string[]) {
    if (this.isRegistered(name)) {
      throw new Error(`Cannot replace existing service ${name}`);
    }

    this.registered[name] = {
      f: once(f),
      dependencies: dependencies || []
    };
  }

  /**
   * Gets a service from the container
   *
   * @param serviceName the service to get
   * @return promise fulfilling the service
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
   *
   * @param definition
   * @return promised service
   */
  private getServiceFromDefinition(definition: Definition, satisfying: string): BPromise {
    return BPromise
      .map(definition.dependencies, dependency => this.get(dependency, satisfying))
      .then(dependencies => definition.f.apply(definition.f, dependencies));
  }

  /**
   * Gets mutliple services at once
   *
   * @param services - service names
   * @return promised services
   */
  public getMatching(services: string[]): Promise<any>[] {
    return BPromise.map(services, name => this.get(name));
  }

  /**
   * Checks to see if a service is registered
   *
   * @param name - name of service to check
   * @return true if registered
   */
  private isRegistered(name: string): Boolean {
    return typeof this.registered[name] !== 'undefined'
  }
}
