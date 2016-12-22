export default class Id {
  public readonly id;

  constructor(id: string) {
    this.id = id;
  }

  toString(): string {
    return this.id;
  }
}
