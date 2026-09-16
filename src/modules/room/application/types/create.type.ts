import { RoomAccessMode, RoomVisibility } from '../../domain/entities/room.entity.types';

export type CreateRoomInput = {
  owner_user_id: string;
  name: string;
  description?: string;
  visibility?: RoomVisibility;
  access_mode?: RoomAccessMode;
  expires_at?: Date;
};
