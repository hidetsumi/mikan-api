import { Module } from '@nestjs/common';
import { CreateUserService } from './application/create-user.service';
import { PrismaUsersRepository } from './infrastructure/persistence/prisma-users.repository';
import { PrismaModule } from 'src/shared/infrastructure/prisma/prisma.module';
import { UsersRepository } from './domain/repository/user.repository';
import { UsersController } from './infrastructure/http/users.controller';

@Module({
  imports: [PrismaModule],
  providers: [
    CreateUserService,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [CreateUserService],
  controllers: [UsersController],
})
export class UsersModule {}
