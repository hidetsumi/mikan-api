import { AuthTokens } from './auth-tokens.types';

export type LoginInput = {
  email: string;
  password: string;
  ip_address: string;
  user_agent: string;
};

export type LoginOutput = AuthTokens & {
  user: {
    id: string;
    email: string;
    name: string;
    last_name: string;
  };
};
