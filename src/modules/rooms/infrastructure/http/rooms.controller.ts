import { Body, Controller, Post } from '@nestjs/common';
import { CreateRoomService } from '../../application/create-room.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly createRoomService: CreateRoomService) {}

  @Post() async createRoom(@Body() createRoomDto: CreateRoomDto) {
    // TODO
    await this.createRoomService.execute(createRoomDto, 'REMOVE');
  }
}
