import { Room } from '../entities/room.entity';
import { CreateRoomData } from './room.repository.types';

export abstract class RoomRepository {
  abstract create(room: CreateRoomData): Promise<Room>;
}
