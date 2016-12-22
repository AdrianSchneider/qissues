export default class User {
  public readonly account: string;
  public readonly name: string;
  public readonly id: string;

  constructor(account: string, name: string, id?: string) {
    this.account = account;
    this.name = name;
    this.id = id;
  }

  public serialize(): SerializedUser {
    return {
      account: this.account,
      name: this.name,
      id: this.id
    };
  }

  public static unserialize(data: SerializedUser): User {
    return new User(data.id, data.name, data.id);
  }
}

export interface SerializedUser {
  account: string | number,
  name: string,
  id?: string
}
