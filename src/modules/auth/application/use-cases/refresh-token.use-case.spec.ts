import { UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from '../../domain/repository/auth.repository';
import { TokenService } from '../../domain/services/token.services';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { RefreshTokenUseCase } from './refresh-token.use-case';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;
  let authRepository: jest.Mocked<AuthRepository>;
  let tokenService: jest.Mocked<TokenService>;

  const input = {
    token: 'raw-refresh-token',
    user_id: 'user-1',
    family: 'family-uuid',
    ip_address: '127.0.0.1',
    user_agent: 'jest',
  };

  const validToken = new RefreshToken({
    id: 'rt-1',
    user_id: 'user-1',
    token_hash: 'some-hash',
    family: 'family-uuid',
    expires_at: new Date(Date.now() + 60_000),
  });

  const expiredToken = new RefreshToken({
    id: 'rt-2',
    user_id: 'user-1',
    token_hash: 'some-hash',
    family: 'family-uuid',
    expires_at: new Date(Date.now() - 60_000),
  });

  beforeEach(() => {
    authRepository = {
      save: jest.fn(),
      findByToken: jest.fn(),
      deleteByToken: jest.fn(),
      deleteByFamily: jest.fn(),
    } as jest.Mocked<AuthRepository>;

    tokenService = {
      generateAccessToken: jest.fn(),
      generateRefreshToken: jest.fn(),
      verifyRefreshToken: jest.fn(),
    } as jest.Mocked<TokenService>;

    useCase = new RefreshTokenUseCase(authRepository, tokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns new tokens and rotates the refresh token', async () => {
    authRepository.findByToken.mockResolvedValue(validToken);
    tokenService.generateAccessToken.mockReturnValue('new-access-token');
    tokenService.generateRefreshToken.mockReturnValue('new-refresh-token');
    authRepository.save.mockResolvedValue(new RefreshToken({ ...validToken, id: 'rt-2' }));

    const result = await useCase.execute(input);

    expect(result.access_token).toBe('new-access-token');
    expect(result.refresh_token).toBe('new-refresh-token');
    expect(authRepository.deleteByToken).toHaveBeenCalledTimes(1);
  });

  it('keeps the token family across a rotation', async () => {
    authRepository.findByToken.mockResolvedValue(validToken);
    tokenService.generateAccessToken.mockReturnValue('new-access-token');
    tokenService.generateRefreshToken.mockReturnValue('new-refresh-token');
    authRepository.save.mockResolvedValue(new RefreshToken({ ...validToken, id: 'rt-2' }));

    await useCase.execute(input);

    expect(authRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ family: input.family }),
    );
    expect(tokenService.generateRefreshToken).toHaveBeenCalledWith(input.user_id, input.family);
  });

  it('throws UnauthorizedException and revokes the family on token reuse', async () => {
    authRepository.findByToken.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(UnauthorizedException);
    expect(authRepository.deleteByFamily).toHaveBeenCalledWith(input.family);
    expect(authRepository.save).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException if the token is expired', async () => {
    authRepository.findByToken.mockResolvedValue(expiredToken);

    await expect(useCase.execute(input)).rejects.toThrow(UnauthorizedException);
    expect(authRepository.deleteByToken).not.toHaveBeenCalled();
    expect(authRepository.save).not.toHaveBeenCalled();
  });
});
