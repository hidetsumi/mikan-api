import { RoomAccessMode, RoomStatus, RoomVisibility } from '@prisma/client';

export type CreateRoomRepository = {
  name: string;
  description: string | null;
  visibility: RoomVisibility;
  access_mode: RoomAccessMode;
  status: RoomStatus;
  owner_user_id: string;
  expiry_date: Date | null;
};
