type UserProps = {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  last_name: string;
};

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly password_hash: string;
  public readonly name: string;
  public readonly last_name: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.password_hash = props.password_hash;
    this.name = props.name;
    this.last_name = props.last_name;
  }
}
