import { BadRequestException, Injectable } from '@nestjs/common';
import { RoomRepository } from '../../domain/repository/room.repository';
import { CreateRoomInput } from '../types/create.type';
import { randomBytes } from 'crypto';
import { ROOM_LIFETIME_MS } from 'src/config/const';
import { Room } from '../../domain/entities/room.entity';

@Injectable()
export class CreateUseCase {
  constructor(private roomRepository: RoomRepository) {}

  async execute(room: CreateRoomInput): Promise<Room> {
    const slug = randomBytes(9).toString('base64url');

    if (room.expires_at && room.expires_at < new Date())
      throw new BadRequestException('Expiration date is invalid');

    const expires_at = room.expires_at ?? new Date(Date.now() + ROOM_LIFETIME_MS);

    const createdRoom = await this.roomRepository.create({ ...room, slug, expires_at });
    return createdRoom;
  }
}
