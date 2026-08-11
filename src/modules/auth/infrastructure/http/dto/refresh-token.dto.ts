import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenRequestDto {
  @ApiProperty({ description: 'Refresh token. POST /auth/refresh reads it from the cookie.' })
  @IsString()
  refreshToken: string;
}
