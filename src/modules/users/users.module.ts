import { Module } from '@nestjs/common';
import { PrismaUsersRepository } from './infrastructure/persistence/prisma-users.repository';
import { PrismaModule } from 'src/shared/infrastructure/prisma/prisma.module';
import { UsersRepository } from './domain/repository/user.repository';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [UsersRepository],
})
export class UsersModule {}
