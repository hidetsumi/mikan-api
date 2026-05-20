type RefreshTokenProps = {
  id: string;
  user_id: string;
  token_hash: string;
  family: string;
  expires_at: Date;
};

export class RefreshToken {
  public readonly id: string;
  public readonly user_id: string;
  public readonly token_hash: string;
  public readonly family: string;
  public readonly expires_at: Date;

  constructor(props: RefreshTokenProps) {
    this.id = props.id;
    this.user_id = props.user_id;
    this.token_hash = props.token_hash;
    this.family = props.family;
    this.expires_at = props.expires_at;
  }
}
