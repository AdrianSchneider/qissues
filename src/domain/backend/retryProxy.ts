interface RetryOptions {
  times: number,
  predicate: (e: Error) => boolean;
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
class RetryProxy {
  private options: RetryOptions;
  constructor(options: RetryOptions) {
    this.options = options;
  }

  public createProxy(target: Object) {
    return new Proxy(target, { get: this.getHandler });
  }

  private getHandler(target: Object, method: string) {
    // only override functions
    if (typeof target[method] !== 'function') return target[method];

    return (...args: any[]): Promise<any> => {
      return target[method].apply(target, args)
        .catch(
          this.options.predicate,
          e => this.retryTrap({ error: e, current: 1, method, target, args })
        );
    };
  }

  /**
   * Recursive retry trap
   * Keeps trying until it suceeds, we hit our limit, or the faiulre is uncatchable
   */
  private retryTrap(attempt: RetryAttempt): Promise<any> {
    if (attempt.current >= this.options.times) return Promise.reject(attempt.error);

    return attempt.target[attempt.method].apply(attempt.target, attempt.args)
      .catch(
        this.options.predicate,
        error => this.retryTrap({ error, current: attempt.current + 1, ...attempt })
      );
  }

}

export default function proxy(object: Object, options: RetryOptions) {
  const p = new RetryProxy(options);
  return p.createProxy(object);
}
