import { RefreshToken } from '../entities/refresh-token.entity';
import { CreateRefreshTokenInput } from './auth.repository.types';

export abstract class AuthRepository {
  abstract save(data: CreateRefreshTokenInput): Promise<RefreshToken>;
  abstract findByToken(token: string): Promise<RefreshToken | null>;
  abstract deleteByToken(token: string, replacedByTokenId: string): Promise<void>;
  abstract deleteByFamily(family: string): Promise<void>;
}
