import { Injectable, UnauthorizedException } from '@nestjs/common';
import { hashToken } from 'src/shared/utils/hash';
import { AuthRepository } from '../../domain/repository/auth.repository';
import { TokenService } from '../../domain/services/token.services';
import { RefreshTokenInput, RefreshTokenOutput } from '../types/refresh-token.types';
import { refreshTokenExpiresAt } from '../token-expiration';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const token_hash = hashToken(input.token);

    const existingToken = await this.authRepository.findByToken(token_hash);

    // An unknown token that still carries a valid signature means the token was
    // already rotated away: treat it as reuse and revoke the whole family.
    if (!existingToken) {
      await this.authRepository.deleteByFamily(input.family);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existingToken.expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const refresh_token = this.tokenService.generateRefreshToken(input.user_id, input.family);
    const access_token = this.tokenService.generateAccessToken(input.user_id);

    const newToken = await this.authRepository.save({
      user_id: input.user_id,
      token_hash: hashToken(refresh_token),
      family: input.family,
      expires_at: refreshTokenExpiresAt(),
      ip_address: input.ip_address,
      user_agent: input.user_agent,
    });

    await this.authRepository.deleteByToken(token_hash, newToken.id);

    return { access_token, refresh_token };
  }
}
