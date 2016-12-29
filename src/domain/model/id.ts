export default class Id {
  public readonly id;

  constructor(id: string | Id | number) {
    this.id = id.toString();
  }

  public toString(): string {
    return this.id;
  }
}
