import { env } from 'src/config/env';

/**
 * Single source of truth for how long a refresh token stays valid.
 * Both login and refresh issue tokens, and they must agree.
 */
export function refreshTokenExpiresAt(): Date {
  return new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN * 1000);
}
