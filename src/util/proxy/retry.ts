import * as Promise from 'bluebird';

interface RetryConfiguration {
  /**
   * Number of times to retry a failure
   */
  times?: number,

  /**
   * Only retry failures that match this check
   */
  errorPredicate?: (e: Error) => boolean;

  /**
   * Calculate number of ms based on the attempt
   */
  backoff?: (attempt: number) => number;
}

interface RetryAttempt {
  current: number,
  method: string,
  target: Object,
  args: any[],
  error: Error
}

/**
 * Responsible for wrapping another class and adding retry behaviour
 */
export default class RetryProxy {
  static defaults = {
    times: 5,
    errorPredicate: () => true,
    backoff: (attempt: number) => 0
  };

  public createProxy<T>(target: T, config?: RetryConfiguration): T {
    const opts = { ...RetryProxy.defaults, ...config };
    return new Proxy(target, { get: this.getHandler(opts).bind(this) });
  }

  private getHandler(config: RetryConfiguration): (...args: any[]) => Promise<any> {
    return (target: Object, method: string) => {
      // only override functions
      if (typeof target[method] !== 'function') return target[method];

      return (...args: any[]): Promise<any> => {
        return Promise.resolve(target[method].apply(target, args))
          .catch(
            config.errorPredicate,
            e => this.retryTrap(config, { error: e, current: 1, method, target, args })
          );
      };
    };
  }

  /**
   * Recursive retry trap
   * Keeps trying until it suceeds, we hit our limit, or the faiulre is uncatchable
   */
  private retryTrap(config: RetryConfiguration, attempt: RetryAttempt): Promise<any> {
    if (attempt.current > config.times) return Promise.reject(attempt.error);

    return Promise.delay(config.backoff(attempt.current))
      .then(() => attempt.target[attempt.method].apply(attempt.target, attempt.args))
      .catch(
        config.errorPredicate,
        error => this.retryTrap(config, { ...attempt, error, current: attempt.current + 1 })
      );
  }
}
