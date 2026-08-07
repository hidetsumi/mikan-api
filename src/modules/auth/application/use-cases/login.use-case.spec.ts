import { UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from 'src/modules/users/domain/repository/user.repository';
import { User } from 'src/modules/users/domain/entities/user.entity';
import { verifyPassword } from 'src/shared/utils/hash';
import { AuthRepository } from '../../domain/repository/auth.repository';
import { TokenService } from '../../domain/services/token.services';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { LoginUseCase } from './login.use-case';

jest.mock('src/shared/utils/hash', () => ({
  ...jest.requireActual('src/shared/utils/hash'),
  verifyPassword: jest.fn(),
}));

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;
  let authRepository: jest.Mocked<AuthRepository>;
  let tokenService: jest.Mocked<TokenService>;

  const input = {
    email: 'test@test.com',
    password: 'pass',
    ip_address: '127.0.0.1',
    user_agent: 'jest',
  };

  const user = new User({
    id: 'user-1',
    email: 'test@test.com',
    name: 'test',
    last_name: 'test1',
    password_hash: 'stored-hash',
  });

  beforeEach(() => {
    usersRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as jest.Mocked<UsersRepository>;

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

    useCase = new LoginUseCase(usersRepository, authRepository, tokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns tokens and the user on valid credentials', async () => {
    usersRepository.findByEmail.mockResolvedValue(user);
    jest.mocked(verifyPassword).mockResolvedValue(true);
    tokenService.generateAccessToken.mockReturnValue('access-token');
    tokenService.generateRefreshToken.mockReturnValue('refresh-token');
    authRepository.save.mockResolvedValue(
      new RefreshToken({
        id: 'rt-1',
        user_id: user.id,
        token_hash: 'hash',
        family: 'family-uuid',
        expires_at: new Date(Date.now() + 60_000),
      }),
    );

    const result = await useCase.execute(input);

    expect(result.access_token).toBe('access-token');
    expect(result.refresh_token).toBe('refresh-token');
    expect(result.user).toEqual(expect.objectContaining({ email: user.email }));
  });

  it('never returns the password hash', async () => {
    usersRepository.findByEmail.mockResolvedValue(user);
    jest.mocked(verifyPassword).mockResolvedValue(true);
    tokenService.generateAccessToken.mockReturnValue('access-token');
    tokenService.generateRefreshToken.mockReturnValue('refresh-token');
    authRepository.save.mockResolvedValue(
      new RefreshToken({
        id: 'rt-1',
        user_id: user.id,
        token_hash: 'hash',
        family: 'family-uuid',
        expires_at: new Date(Date.now() + 60_000),
      }),
    );

    const result = await useCase.execute(input);

    expect(result.user).not.toHaveProperty('password_hash');
  });

  it('persists the refresh token hashed, never raw', async () => {
    usersRepository.findByEmail.mockResolvedValue(user);
    jest.mocked(verifyPassword).mockResolvedValue(true);
    tokenService.generateAccessToken.mockReturnValue('access-token');
    tokenService.generateRefreshToken.mockReturnValue('refresh-token');
    authRepository.save.mockResolvedValue(
      new RefreshToken({
        id: 'rt-1',
        user_id: user.id,
        token_hash: 'hash',
        family: 'family-uuid',
        expires_at: new Date(Date.now() + 60_000),
      }),
    );

    await useCase.execute(input);

    const saved = authRepository.save.mock.calls[0][0];
    expect(saved.token_hash).not.toBe('refresh-token');
    expect(saved.expires_at.getTime()).toBeGreaterThan(Date.now());
  });

  it('throws UnauthorizedException if the user does not exist', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(UnauthorizedException);
    expect(authRepository.save).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedException if the password is wrong', async () => {
    usersRepository.findByEmail.mockResolvedValue(user);
    jest.mocked(verifyPassword).mockResolvedValue(false);

    await expect(useCase.execute(input)).rejects.toThrow(UnauthorizedException);
    expect(authRepository.save).not.toHaveBeenCalled();
  });
});
