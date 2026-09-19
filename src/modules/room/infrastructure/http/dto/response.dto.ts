import {
  RoomAccessMode,
  RoomStatus,
  RoomVisibility,
} from 'src/modules/room/domain/entities/room.entity.types';

export class RoomResponseDto {
  id: string;
  owner_user_id: string;
  slug: string;
  name: string;
  description: string | null;
  visibility: RoomVisibility;
  access_mode: RoomAccessMode;
  status: RoomStatus;
  expires_at: Date | null;
  last_activity_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
