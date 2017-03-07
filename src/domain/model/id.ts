/**
 * Represents an issue identifier
 */
export default class Id {
  public readonly id: string;

  /**
   * Converts the id to a string
   */
  constructor(id: string | Id | number) {
    this.id = id.toString();
  }

  public toString(): string {
    return this.id;
  }
}
