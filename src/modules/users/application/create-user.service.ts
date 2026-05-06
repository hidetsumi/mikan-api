import { ConflictException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../domain/repository/user.repository';
import bcrypt from 'bcryptjs';

import { CreateUserDto } from '../infrastructure/http/dto/create-user.dto';
import { User } from '../domain/entities/user.entity';

@Injectable()
export class CreateUserService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findByEmail(
      createUserDto.email,
    );

    if (existingUser)
      throw new ConflictException('User with this email already exists');

    const passwordHashed = await bcrypt.hash(createUserDto.password, 10);

    return this.usersRepository.create({
      email: createUserDto.email,
      lastName: createUserDto.lastName,
      name: createUserDto.name,
      passwordHash: passwordHashed,
    });
  }
}
