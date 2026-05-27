import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UsersRepository } from '../../domain/repository/user.repository';
import { Injectable } from '@nestjs/common';
import { CreateUserInput } from '../../domain/repository/user.repository.types';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async create(input: CreateUserInput): Promise<User> {
    const createdUser = await this.prismaService.user.create({
      data: input,
    });
    return new User(createdUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!record) {
      return null;
    }

    return new User(record);
  }
}
