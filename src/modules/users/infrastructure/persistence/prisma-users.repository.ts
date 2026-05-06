import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UsersRepository } from '../../domain/repository/user.repository';
import { Injectable } from '@nestjs/common';
import { CreateUserRepository } from '../../domain/repository/user.repository.types';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async create(user: CreateUserRepository): Promise<User> {
    const createdUser = await this.prismaService.user.create({
      data: user,
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
