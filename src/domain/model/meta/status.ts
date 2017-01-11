export default class Status {
  public readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  public serialize(): SerializedStatus {
    return { name: this.name };
  }

  public toString(): string {
    return this.name;
  }

  public static unserialize(data: SerializedStatus): Status {
    return new Status(data.name);
  }
}

export interface SerializedStatus {
  name: string
}
