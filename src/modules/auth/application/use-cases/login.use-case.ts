import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { UsersRepository } from 'src/modules/users/domain/repository/user.repository';
import { hashToken, verifyPassword } from 'src/shared/utils/hash';
import { AuthRepository } from '../../domain/repository/auth.repository';
import { TokenService } from '../../domain/services/token.services';
import { LoginInput, LoginOutput } from '../types/login.types';
import { refreshTokenExpiresAt } from '../token-expiration';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.usersRepository.findByEmail(input.email);

    // Same message for "no such user" and "wrong password" so the response
    // cannot be used to enumerate registered emails.
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await verifyPassword(input.password, user.password_hash);

    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    const family = randomUUID();
    const refresh_token = this.tokenService.generateRefreshToken(user.id, family);
    const access_token = this.tokenService.generateAccessToken(user.id);

    await this.authRepository.save({
      user_id: user.id,
      token_hash: hashToken(refresh_token),
      family,
      expires_at: refreshTokenExpiresAt(),
      ip_address: input.ip_address,
      user_agent: input.user_agent,
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        last_name: user.last_name,
      },
    };
  }
}
