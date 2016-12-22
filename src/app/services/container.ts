import _       from 'underscore'
import Promise from 'bluebird'

export class Container {
  private registered: Object = {};
  private readyServices: Object = {};

  /**
   * Registers a new service in the container
   *
   * @param name the name of the service
   * @param f the function returning the service
   * @param depenencies the services this service depends on
   */
  public registerService(name: string, f: Function, dependencies: Promise[]) {
    if (this.isRegistered(name)) {
      throw new Error(`Cannot replace existing service ${name}`);
    }

    this.registered[name] = { f: _.once(f), dependencies };
  }

  /**
   * Gets a service from the container
   *
   * @param serviceName the service to get
   * @return promise fulfilling the service
   */
  public get(serviceName: string): Promise {
    if (!this.isRegistered(serviceName)) {
      throw new ReferenceError(`Cannot get undefined service ${serviceName}`);
    }

    if (typeof this.readyServices[serviceName] !== 'undefined') {
      return Promise.resolve(this.readyServices[serviceName]);
    }

    return this.getServiceFromDefinition(this.registered[serviceName])
      .tap(service => this.readyServices[serviceName] = service)
  }

  /**
   * Gets the services after waiting for its dependencies
   *
   * @param definition
   * @return promised service
   */
  private getServiceFromDefinition(definition: Definition): Promise {
    return Promise
      .map(definition.dependencies, dependency => this.get(dependency))
      .then(dependencies => definition.f.apply(definition.f, dependencies));
  }

  /**
   * Gets mutliple services at once
   *
   * @param services - service names
   * @return promised services
   */
  public getMatching(services: string[]): Promise[] {
    return Promise.map(services, this.get);
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

interface Definition {
  f: Function,
  dependencies: Array<any>
}
