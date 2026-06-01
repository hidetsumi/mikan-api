import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

jest.mock('bcryptjs');
import { UsersRepository } from 'src/modules/users/domain/repository/user.repository';
import { AuthRepository } from '../domain/repository/auth.repository';
import { TokenService } from '../domain/services/token.services';
import { User } from 'src/modules/users/domain/entities/user.entity';
import { RefreshToken } from '../domain/entities/refresh-token.entity';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  } as jest.Mocked<UsersRepository>;

  const mockAuthRepository = {
    save: jest.fn(),
    findByToken: jest.fn(),
    deleteByToken: jest.fn(),
    deleteByFamily: jest.fn(),
  } as jest.Mocked<AuthRepository>;

  const mockTokenService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  } as jest.Mocked<TokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersRepository, useValue: mockUserRepository },
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = new User({
    id: 'user-1',
    email: 'test@test.com',
    name: 'test',
    last_name: 'test1',
    password_hash: 'pa$$',
  });

  // ─── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should register a user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@test.com',
        last_name: 'test1',
        name: 'test',
        password: 'pass',
      });

      expect(result).toEqual(
        expect.objectContaining({
          id: 'user-1',
          email: 'test@test.com',
          name: 'test',
          last_name: 'test1',
        }),
      );
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException if email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@test.com',
          last_name: 'test1',
          name: 'test',
          password: 'pass',
        }),
      ).rejects.toThrow(ConflictException);

      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  // ─── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    const loginInput = {
      email: 'test@test.com',
      password: 'pass',
      ip_address: '127.0.0.1',
      user_agent: 'jest',
    };

    it('should return tokens and user on valid credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
      mockTokenService.generateAccessToken.mockReturnValue('access-token');
      mockTokenService.generateRefreshToken.mockReturnValue('refresh-token');
      mockAuthRepository.save.mockResolvedValue(
        new RefreshToken({
          id: 'rt-1',
          user_id: mockUser.id,
          token_hash: 'hash',
          family: 'family-uuid',
          expires_at: new Date(Date.now() + 60_000),
        }),
      );

      const result = await service.login(loginInput);

      expect(result.access_token).toBe('access-token');
      expect(result.refresh_token).toBe('refresh-token');
      expect(result.user).toEqual(expect.objectContaining({ email: mockUser.email }));
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginInput)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login(loginInput)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthRepository.save).not.toHaveBeenCalled();
    });
  });

  // ─── refreshToken ──────────────────────────────────────────────────────────

  describe('refreshToken', () => {
    const refreshInput = {
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

    it('should return new tokens and rotate the refresh token', async () => {
      mockAuthRepository.findByToken.mockResolvedValue(validToken);
      mockTokenService.generateAccessToken.mockReturnValue('new-access-token');
      mockTokenService.generateRefreshToken.mockReturnValue('new-refresh-token');
      mockAuthRepository.save.mockResolvedValue(new RefreshToken({ ...validToken, id: 'rt-2' }));

      const result = await service.refreshToken(refreshInput);

      expect(result.access_token).toBe('new-access-token');
      expect(result.refresh_token).toBe('new-refresh-token');
      expect(mockAuthRepository.deleteByToken).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException and delete family on token reuse', async () => {
      mockAuthRepository.findByToken.mockResolvedValue(null);

      await expect(service.refreshToken(refreshInput)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthRepository.deleteByFamily).toHaveBeenCalledWith(refreshInput.family);
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      mockAuthRepository.findByToken.mockResolvedValue(expiredToken);

      await expect(service.refreshToken(refreshInput)).rejects.toThrow(UnauthorizedException);
      expect(mockAuthRepository.deleteByToken).not.toHaveBeenCalled();
    });
  });
});
