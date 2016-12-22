export default class Sprint {
  public readonly id: string | number;
  public readonly name: string;

  constructor(id: string | number, name: string) {
    this.id = id;
    this.name = name;
  }

  public serialize(): SerializedSprint {
    return {
      id: this.id,
      name: this.name
    };
  }

  public toString(): string {
    return this.name;
  }

  public static unserialize(data: SerializedSprint): Sprint {
    return new Sprint(data.id, data.name);
  }
}

export interface SerializedSprint {
  id: string | number,
  name: string
}
