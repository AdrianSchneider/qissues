export default class HealthCheck {

  public success(): Promise<number> {
    return Promise.resolve(5);
  }

  public fail(): Promise<void> {
    return Promise.reject(new Error('nope'));
  }


}
