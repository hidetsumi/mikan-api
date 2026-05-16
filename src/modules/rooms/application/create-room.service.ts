import { Injectable } from '@nestjs/common';
import { RoomsRepository } from '../domain/repository/room.repository';
import { CreateRoomRepository } from '../domain/repository/room.repository.types';
import { Room } from '../domain/entities/room.entity';
import { CreateRoomDto } from '../infrastructure/http/dto/create-room.dto';

@Injectable()
export class CreateRoomService {
  constructor(private readonly roomRepository: RoomsRepository) {}

  private createSlug(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  async execute(
    createRoomDto: CreateRoomDto,
    ownerUserId: string,
  ): Promise<Room> {
    const slug = this.createSlug(createRoomDto.name);

    const roomPayload: CreateRoomRepository = {
      name: createRoomDto.name,
      description: createRoomDto.description ?? null,
      owner_user_id: ownerUserId,
      slug: slug,
      visibility: createRoomDto.visibility,
      access_mode: createRoomDto.access_mode,
      status: createRoomDto.status,
      expiry_date: createRoomDto.expiry_date ?? null,
    };
    return this.roomRepository.create(roomPayload);
  }
}
