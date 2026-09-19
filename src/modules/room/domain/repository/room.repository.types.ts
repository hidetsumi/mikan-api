import { RoomAccessMode, RoomVisibility } from '../entities/room.entity.types';

export type CreateRoomData = {
  owner_user_id: string;
  slug: string;
  name: string;
  description?: string;
  visibility?: RoomVisibility;
  access_mode?: RoomAccessMode;
  expires_at?: Date;
};
