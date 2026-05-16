import { Room } from '../entities/room.entity';
import { CreateRoomRepository } from './room.repository.types';

export abstract class RoomsRepository {
  abstract findById(id: string): Promise<Room | null>;
  abstract findBySlug(slug: string): Promise<Room | null>;
  abstract findByOwnerUserId(ownerUserId: string): Promise<Room[]>;
  abstract existsBySlug(slug: string): Promise<boolean>;
  abstract create(room: CreateRoomRepository): Promise<Room>;
}
