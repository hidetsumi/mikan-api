import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { TodoModule } from './modules/todo/todo.module';
import { RoomModule } from './modules/room/room.module';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, TodoModule, RoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
