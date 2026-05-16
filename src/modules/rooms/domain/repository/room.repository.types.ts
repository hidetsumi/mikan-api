import {
  RoomVisibility,
  RoomAccessMode,
  RoomStatus,
} from '../entities/room.entity';

export type CreateRoomRepository = {
  name: string;
  description: string | null;
  visibility: RoomVisibility;
  access_mode: RoomAccessMode;
  status: RoomStatus;
  slug: string;
  owner_user_id: string;
  expiry_date: Date | null;
};
