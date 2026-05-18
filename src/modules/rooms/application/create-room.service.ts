import { Injectable } from '@nestjs/common';
import { RoomsRepository } from '../domain/repository/room.repository';
import { CreateRoomRepository } from '../domain/repository/room.repository.types';
import { Room } from '../domain/entities/room.entity';
import { CreateRoomDto } from '../infrastructure/http/dto/create-room.dto';

@Injectable()
export class CreateRoomService {
  constructor(private readonly roomRepository: RoomsRepository) {}

  async execute(
    createRoomDto: CreateRoomDto,
    ownerUserId: string,
  ): Promise<Room> {
    const roomPayload: CreateRoomRepository = {
      name: createRoomDto.name,
      description: createRoomDto.description ?? null,
      owner_user_id: ownerUserId,
      visibility: createRoomDto.visibility,
      access_mode: createRoomDto.access_mode,
      status: createRoomDto.status,
      expiry_date: createRoomDto.expiry_date ?? null,
    };
    return this.roomRepository.create(roomPayload);
  }
}
