import { Module } from '@nestjs/common';
import { CreateRoomService } from './application/create-room.service';
import { RoomsRepository } from './domain/repository/room.repository';
import { RoomsController } from './infrastructure/http/rooms.controller';
import { PrismaRoomsRepository } from './infrastructure/persistence/prisma-rooms.repository';
import { PrismaModule } from 'src/shared/infrastructure/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    CreateRoomService,
    {
      provide: RoomsRepository,
      useClass: PrismaRoomsRepository,
    },
  ],
  controllers: [RoomsController],
})
export class RoomsModule {}
