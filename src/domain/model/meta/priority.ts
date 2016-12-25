export default class Priority {
  public readonly priority: number;
  public readonly name: string;

  constructor(priority: number | string, name?: string) {
    this.priority = parseInt("" + priority, 10);
    this.name = name || '';
  }

  public toString(): string {
    return this.name || "" + this.priority;
  }

  public serialize(): SerializedPriority {
    return {
      priority: this.priority,
      name: this.name
    };
  }

  public static unserialize(data: SerializedPriority): Priority {
    return new Priority(data.priority, data.name);
  }
}

interface SerializedPriority {
  priority: number,
  name: string
}
