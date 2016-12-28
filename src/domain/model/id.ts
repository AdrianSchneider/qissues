export default class Id {
  public readonly id;

  constructor(id: string | Id) {
    this.id = id.toString();
  }

  public toString(): string {
    return this.id;
  }
}
