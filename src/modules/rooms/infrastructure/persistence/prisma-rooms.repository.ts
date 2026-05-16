import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { Room } from '../../domain/entities/room.entity';
import { RoomsRepository } from '../../domain/repository/room.repository';
import { CreateRoomRepository } from '../../domain/repository/room.repository.types';

@Injectable()
export class PrismaRoomsRepository implements RoomsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<Room | null> {
    const record = await this.prismaService.room.findUnique({
      where: { id },
    });

    if (!record) {
      return null;
    }

    return new Room({
      id: record.id,
      name: record.name,
      description: record.description,
      owner_user_id: record.owner_user_id,
      slug: record.slug,
      visibility: record.visibility,
      access_mode: record.access_mode,
      status: record.status,
      expiry_date: record.expiry_date,
    });
  }

  async findBySlug(slug: string): Promise<Room | null> {
    const record = await this.prismaService.room.findFirst({
      where: { slug },
    });

    if (!record) {
      return null;
    }

    return new Room({
      id: record.id,
      name: record.name,
      description: record.description,
      owner_user_id: record.owner_user_id,
      slug: record.slug,
      visibility: record.visibility,
      access_mode: record.access_mode,
      status: record.status,
      expiry_date: record.expiry_date,
    });
  }

  async findByOwnerUserId(ownerUserId: string): Promise<Room[]> {
    const records = await this.prismaService.room.findMany({
      where: { owner_user_id: ownerUserId },
    });

    return records.map(
      (record) =>
        new Room({
          id: record.id,
          name: record.name,
          description: record.description,
          owner_user_id: record.owner_user_id,
          slug: record.slug,
          visibility: record.visibility,
          access_mode: record.access_mode,
          status: record.status,
          expiry_date: record.expiry_date,
        }),
    );
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const record = await this.prismaService.room.findFirst({
      where: { slug },
      select: { id: true },
    });

    return record !== null;
  }

  async create(room: CreateRoomRepository): Promise<Room> {
    const createdRoom = await this.prismaService.room.create({
      data: room,
    });

    return new Room({
      id: createdRoom.id,
      name: createdRoom.name,
      description: createdRoom.description,
      owner_user_id: createdRoom.owner_user_id,
      slug: createdRoom.slug,
      visibility: createdRoom.visibility,
      access_mode: createdRoom.access_mode,
      status: createdRoom.status,
      expiry_date: createdRoom.expiry_date,
    });
  }
}
