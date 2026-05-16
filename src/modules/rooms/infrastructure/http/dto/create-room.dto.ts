import { RoomAccessMode, RoomStatus, RoomVisibility } from '@prisma/client';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(RoomVisibility)
  visibility: RoomVisibility;

  @IsEnum(RoomAccessMode)
  access_mode: RoomAccessMode;

  @IsEnum(RoomStatus)
  status: RoomStatus;

  @IsOptional()
  @IsString()
  @IsDate()
  expiry_date: Date;
}
