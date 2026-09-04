export const RoomVisibility = {
  PUBLIC: 'PUBLIC',
  PRIVATE: 'PRIVATE',
} as const;

export const RoomAccessMode = {
  ANONYMOUS: 'ANONYMOUS',
  AUTHENTICATED_ONLY: 'AUTHENTICATED_ONLY',
} as const;

export const RoomStatus = {
  ACTIVE: 'ACTIVE',
  ARCHIVED: 'ARCHIVED',
  EXPIRED: 'EXPIRED',
} as const;

export type RoomProps = {
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
};

export type RoomVisibility = (typeof RoomVisibility)[keyof typeof RoomVisibility];
export type RoomAccessMode = (typeof RoomAccessMode)[keyof typeof RoomAccessMode];
export type RoomStatus = (typeof RoomStatus)[keyof typeof RoomStatus];
