import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/modules/users/domain/repository/user.repository';

import bcrypt from 'bcryptjs';
import { User } from 'src/modules/users/domain/entities/user.entity';
import { AuthRepository } from '../domain/repository/auth.repository';
import { LoginInput, LoginOutput } from './types/login.types';
import { RegisterInput } from './types/register.types';
import {
  RefreshTokenInput,
  RefreshTokenOutput,
} from './types/refresh-token.types';
import { UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../domain/services/token.services';
import { hashToken } from 'src/shared/utils/hash';
import { randomUUID } from 'node:crypto';
import { env } from 'src/config/env';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}

  async register(registerInput: RegisterInput): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(
      registerInput.email,
    );

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHashed = await bcrypt.hash(registerInput.password, 10);

    return this.usersRepository.create({
      email: registerInput.email,
      name: registerInput.name,
      last_name: registerInput.last_name,
      password_hash: passwordHashed,
    });
  }

  async login(loginInput: LoginInput): Promise<LoginOutput> {
    const user = await this.usersRepository.findByEmail(loginInput.email);

    if (!user) throw new ConflictException('User not found');

    const isPasswordValid = await bcrypt.compare(
      loginInput.password,
      user.password_hash,
    );

    if (!isPasswordValid) throw new ConflictException('Invalid password');

    const family = randomUUID();
    const refresh_token = this.tokenService.generateRefreshToken(
      user.id,
      family,
    );
    const access_token = this.tokenService.generateAccessToken(user.id);

    await this.authRepository.save({
      user_id: user.id,
      token_hash: hashToken(refresh_token),
      family,
      expires_at: new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN * 1000),
      ip_address: loginInput.ip_address,
      user_agent: loginInput.user_agent,
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

  async refreshToken(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const token_hash = hashToken(input.token);

    const existingToken = await this.authRepository.findByToken(token_hash);

    if (!existingToken) {
      await this.authRepository.deleteByFamily(input.family);
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existingToken.expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.authRepository.deleteByToken(token_hash);

    const refresh_token = this.tokenService.generateRefreshToken(
      input.user_id,
      input.family,
    );
    const access_token = this.tokenService.generateAccessToken(input.user_id);

    await this.authRepository.save({
      user_id: input.user_id,
      token_hash: hashToken(refresh_token),
      family: input.family,
      expires_at: new Date(Date.now() + env.JWT_REFRESH_EXPIRES_IN * 1000),
      ip_address: input.ip_address,
      user_agent: input.user_agent,
    });

    return { access_token, refresh_token };
  }
}
