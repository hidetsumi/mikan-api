import { JWT_REFRESH_EXPIRES_IN_SECONDS } from 'src/config/const';

/**
 * Single source of truth for how long a refresh token stays valid.
 * Both login and refresh issue tokens, and they must agree.
 */
export function refreshTokenExpiresAt(): Date {
  return new Date(Date.now() + JWT_REFRESH_EXPIRES_IN_SECONDS * 1000);
}
