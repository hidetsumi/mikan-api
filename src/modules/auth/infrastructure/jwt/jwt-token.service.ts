import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService, RefreshTokenPayload } from '../../domain/services/token.services';
import { JwtService } from '@nestjs/jwt';
import { env } from 'src/config/env';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(userId: string): string {
    return this.jwtService.sign({ sub: userId });
  }

  generateRefreshToken(userId: string, family: string): string {
    return this.jwtService.sign(
      { sub: userId, family },
      { secret: env.JWT_REFRESH_SECRET, expiresIn: env.JWT_REFRESH_EXPIRES_IN },
    );
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: env.JWT_REFRESH_SECRET,
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
