import { Module } from '@nestjs/common';
import { RoomController } from './infrastructure/http/room.controller';

@Module({
  controllers: [RoomController],
})
export class RoomModule {}
