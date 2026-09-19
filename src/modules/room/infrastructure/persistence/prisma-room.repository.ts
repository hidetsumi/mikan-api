import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { RoomRepository } from '../../domain/repository/room.repository';
import { CreateRoomData } from '../../domain/repository/room.repository.types';
import { Room } from '../../domain/entities/room.entity';

@Injectable()
export class PrismaRoomRepository implements RoomRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(room: CreateRoomData): Promise<Room> {
    const createdRoom = await this.prismaService.room.create({
      data: { ...room },
    });

    return new Room(createdRoom);
  }
}
