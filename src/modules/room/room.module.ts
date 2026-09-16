import { Module } from '@nestjs/common';
import { RoomController } from './infrastructure/http/room.controller';
import { RoomRepository } from './domain/repository/room.repository';
import { PrismaRoomRepository } from './infrastructure/persistence/prisma-room.repository';
import { PrismaModule } from 'src/shared/infrastructure/prisma/prisma.module';
import { RoomUseCases } from './application/use-cases';

@Module({
  controllers: [RoomController],
  providers: [...RoomUseCases, { provide: RoomRepository, useClass: PrismaRoomRepository }],
  imports: [PrismaModule],
})
export class RoomModule {}
