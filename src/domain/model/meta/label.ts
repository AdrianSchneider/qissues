export default class Label {
  public readonly id: string;
  public readonly name: string;

  constructor(id: string | number, name: string) {
    this.id = id.toString();
    this.name = name;
  }

  public serialize(): SerializedLabel {
    return {
      id: this.id,
      name: this.name
    };
  }

  public toString(): string {
    return this.name;
  }

  public static unserialize(data: SerializedLabel): Label {
    return new Label(data.id, data.name);
  }
}

interface SerializedLabel {
  id: string,
  name: string
}
