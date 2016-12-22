export default class MoreInfoRequiredError extends Error {
  public expectations;

  constructor(message: string, expectations: any) {
    super();
    this.message = message;
    this.expectations = expectations;
  }
}
