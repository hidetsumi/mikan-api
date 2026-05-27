export type RefreshTokenPayload = {
  sub: string;
  family: string;
};

export type JwtUserPayload = {
  user_id: string;
  family: string;
};

export abstract class TokenService {
  abstract generateAccessToken(userId: string): string;
  abstract generateRefreshToken(userId: string, family: string): string;
  abstract verifyRefreshToken(token: string): Promise<RefreshTokenPayload>;
}
