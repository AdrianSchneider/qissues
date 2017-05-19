import { delay } from '../promise-helpers';

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
    return new Proxy(<any>target, { get: this.getHandler(opts).bind(this) });
  }

  private getHandler(config: RetryConfiguration): (...args: any[]) => Promise<any> {
    return (target: Object, method: string) => {
      // only override functions
      if (typeof target[method] !== 'function') return target[method];

      return async (...args: any[]): Promise<any> => {
        try {
          return await target[method].apply(target, args);
        } catch (e) {
          if (config.errorPredicate(e)) {
            return this.retryTrap(config, { error: e, current: 1, method, target, args });
          }

          throw e;
        }
      };
    };
  }

  /**
   * Recursive retry trap
   * Keeps trying until it suceeds, we hit our limit, or the faiulre is uncatchable
   */
  private async retryTrap(config: RetryConfiguration, attempt: RetryAttempt): Promise<any> {
    if (attempt.current > config.times) throw attempt.error;
    await delay(config.backoff(attempt.current));

    try {
      return await attempt.target[attempt.method].apply(attempt.target, attempt.args);
    } catch(e) {
      if (config.errorPredicate(e)) {
        return await this.retryTrap(config, { ...attempt, e, current: attempt.current + 1 });
      }

      throw e;
    }
  }
}
