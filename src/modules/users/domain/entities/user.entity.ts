type UserProps = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  lastName: string;
};

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly passwordHash: string;
  public readonly name: string;
  public readonly lastName: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.name = props.name;
    this.lastName = props.lastName;
  }
}
