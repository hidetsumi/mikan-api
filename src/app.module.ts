import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './shared/infrastructure/prisma/prisma.module';
import { RoomsModule } from './modules/rooms/rooms.module';

@Module({
  imports: [UsersModule, PrismaModule, RoomsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
