import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { RoomAccessMode, RoomVisibility } from 'src/modules/room/domain/entities/room.entity.types';
import { Trim } from 'src/shared/infrastructure/http/trim.decorator';

export class CreateRoomRequestDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsEnum(RoomVisibility)
  visibility?: RoomVisibility;

  @IsOptional()
  @IsEnum(RoomAccessMode)
  access_mode?: RoomAccessMode;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expires_at?: Date;
}
