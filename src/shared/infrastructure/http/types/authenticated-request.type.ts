import { AccessTokenPayload } from 'src/modules/auth/infrastructure/types/access-token-payload.type';

export type AuthenticatedRequest = Request & {
  user: AccessTokenPayload;
};
