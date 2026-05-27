export type CreateRefreshTokenInput = {
  user_id: string;
  token_hash: string;
  family: string;
  expires_at: Date;
  ip_address: string;
  user_agent: string;
};
