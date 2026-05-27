import { Injectable } from '@nestjs/common';
import { AuthRepository } from '../../domain/repository/auth.repository';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { CreateRefreshTokenInput } from '../../domain/repository/auth.repository.types';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';

@Injectable()
export class PrismaAuthRepository implements AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async save(data: CreateRefreshTokenInput): Promise<RefreshToken> {
    const record = await this.prismaService.refreshToken.create({
      data: {
        user_id: data.user_id,
        token_hash: data.token_hash,
        family: data.family,
        expires_at: data.expires_at,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
      },
    });

    return new RefreshToken({
      id: record.id,
      user_id: record.user_id,
      token_hash: record.token_hash,
      family: record.family,
      expires_at: record.expires_at,
    });
  }

  async findByToken(token_hash: string): Promise<RefreshToken | null> {
    const record = await this.prismaService.refreshToken.findFirst({
      where: { token_hash, revoked_at: null },
    });

    if (!record) return null;

    return new RefreshToken({
      id: record.id,
      user_id: record.user_id,
      token_hash: record.token_hash,
      family: record.family,
      expires_at: record.expires_at,
    });
  }

  async deleteByToken(token_hash: string, replaced_by_token_id: string): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: { token_hash },
      data: { revoked_at: new Date(), replaced_by_token_id },
    });
  }

  async deleteByFamily(family: string): Promise<void> {
    await this.prismaService.refreshToken.updateMany({
      where: { family },
      data: { revoked_at: new Date() },
    });
  }
}
