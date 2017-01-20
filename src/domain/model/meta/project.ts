export default class Project {
  public readonly id: string;
  public readonly name: string;
  public readonly internalId: string;

  constructor(id: string | number, name?: string, internalId?: string) {
    this.id = id.toString();
    this.name = name || '';
    this.internalId = internalId || '';
  }

  public serialize(): SerializedProject {
    return {
      id: this.id,
      name: this.name,
      internalId: this.internalId
    };
  }

  public toString(): string {
    return this.id;
  }

  public static unserialize(data: SerializedProject): Project {
    return new Project(data.id, data.name, data.internalId);
  }
}

export interface SerializedProject {
  id: string | number,
  name: string,
  internalId?: string
}
