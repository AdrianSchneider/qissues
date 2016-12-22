export default class Type {
  public readonly id: string | number;
  public readonly name: string;

  constructor(id: string | number, name: string) {
    this.id = id;
    this.name = name;
  }

  public serialize(): SerializedType {
    return {
      id: this.id,
      name: this.name
    };
  }

  public toString(): string {
    return this.name;
  }

  public static unserialize(data: SerializedType): Type {
    return new Type(data.id, data.name);
  }
}

export interface SerializedType {
  id: string | number,
  name: string
}
