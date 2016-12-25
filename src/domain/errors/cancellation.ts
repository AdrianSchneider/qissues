export default class Cancellation extends Error {
  constructor(message?: string) {
    super();
    this.message = message || '';
    this.name = 'CancellationError';
  }
}
