export default class NoConfigError extends Error {
  constructor(message: string) {
    super();
    this.name = 'NoConfigError';
    this.message = message;
  }
}
