import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from 'src/modules/users/domain/repository/user.repository';
import { User } from 'src/modules/users/domain/entities/user.entity';
import { hashPassword } from 'src/shared/utils/hash';
import { RegisterInput } from '../types/register.types';

@Injectable()
export class RegisterUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(input: RegisterInput): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(input.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    return this.usersRepository.create({
      email: input.email,
      name: input.name,
      last_name: input.last_name,
      password_hash: await hashPassword(input.password),
    });
  }
}
