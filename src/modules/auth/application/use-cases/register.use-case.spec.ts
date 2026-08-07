import { ConflictException } from '@nestjs/common';
import { UsersRepository } from 'src/modules/users/domain/repository/user.repository';
import { User } from 'src/modules/users/domain/entities/user.entity';
import { hashPassword } from 'src/shared/utils/hash';
import { RegisterUseCase } from './register.use-case';

// Only the bcrypt-backed helpers are mocked; hashToken stays real so nothing
// else in the module is silently stubbed out.
jest.mock('src/shared/utils/hash', () => ({
  ...jest.requireActual('src/shared/utils/hash'),
  hashPassword: jest.fn(),
}));

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let usersRepository: jest.Mocked<UsersRepository>;

  const input = {
    email: 'test@test.com',
    password: 'pass',
    name: 'test',
    last_name: 'test1',
  };

  const existingUser = new User({
    id: 'user-1',
    email: 'test@test.com',
    name: 'test',
    last_name: 'test1',
    password_hash: 'already-hashed',
  });

  beforeEach(() => {
    usersRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as jest.Mocked<UsersRepository>;

    jest.mocked(hashPassword).mockResolvedValue('hashed-password');

    useCase = new RegisterUseCase(usersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('registers a user when the email is free', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);
    usersRepository.create.mockResolvedValue(existingUser);

    const result = await useCase.execute(input);

    expect(result).toEqual(existingUser);
    expect(usersRepository.create).toHaveBeenCalledTimes(1);
  });

  it('stores the hashed password, never the raw one', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);
    usersRepository.create.mockResolvedValue(existingUser);

    await useCase.execute(input);

    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ password_hash: 'hashed-password' }),
    );
    expect(usersRepository.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ password_hash: 'pass' }),
    );
  });

  it('throws ConflictException if the email already exists', async () => {
    usersRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(useCase.execute(input)).rejects.toThrow(ConflictException);
    expect(usersRepository.create).not.toHaveBeenCalled();
  });
});
