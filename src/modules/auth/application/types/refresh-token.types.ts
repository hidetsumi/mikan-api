import { AuthTokens } from './auth-tokens.types';

export type RefreshTokenInput = {
  token: string;
  user_id: string;
  family: string;
  ip_address: string;
  user_agent: string;
};

export type RefreshTokenOutput = AuthTokens;
