import { RoomAccessMode, RoomProps, RoomStatus, RoomVisibility } from './room.entity.types';

export class Room {
  public readonly id: string;
  public readonly owner_user_id: string;
  public readonly slug: string;
  public readonly name: string;
  public readonly description: string | null;
  public readonly visibility: RoomVisibility;
  public readonly access_mode: RoomAccessMode;
  public readonly status: RoomStatus;
  public readonly expires_at: Date | null;
  public readonly last_activity_at: Date | null;
  public readonly created_at: Date;
  public readonly updated_at: Date;

  constructor(props: RoomProps) {
    this.id = props.id;
    this.owner_user_id = props.owner_user_id;
    this.slug = props.slug;
    this.name = props.name;
    this.description = props.description;
    this.visibility = props.visibility;
    this.access_mode = props.access_mode;
    this.status = props.status;
    this.expires_at = props.expires_at;
    this.last_activity_at = props.last_activity_at;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
  }
}
