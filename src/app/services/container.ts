import { once }     from 'underscore'
import * as Promise from 'bluebird'

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
   */
  public registerService(name: string, f: Function, dependencies: string[] = []) {
    if (this.isRegistered(name)) {
      throw new Error(`Cannot replace existing service ${name}`);
    }

    this.registered[name] = {
      f: once(f),
      dependencies: dependencies
    };
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
      .then(dependencies => definition.f.apply(definition.f, dependencies));
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
