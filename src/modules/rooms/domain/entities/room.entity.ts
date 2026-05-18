import { RoomAccessMode, RoomStatus, RoomVisibility } from '@prisma/client';

type RoomProps = {
  id: string;
  name: string;
  description: string | null;
  owner_user_id: string;
  visibility: RoomVisibility;
  access_mode: RoomAccessMode;
  status: RoomStatus;
  expiry_date: Date | null;
};

export class Room {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string | null;
  public readonly owner_user_id: string;
  public readonly visibility: RoomVisibility;
  public readonly access_mode: RoomAccessMode;
  public readonly status: RoomStatus;
  public readonly expiry_date: Date | null;

  constructor(props: RoomProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.owner_user_id = props.owner_user_id;
    this.visibility = props.visibility;
    this.access_mode = props.access_mode;
    this.status = props.status;
    this.expiry_date = props.expiry_date;
  }
}
