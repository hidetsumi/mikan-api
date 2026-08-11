import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({ example: 'ada@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'correct-horse-battery' })
  @IsString()
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ format: 'uuid', example: '3f1c5a2e-9b7d-4f6a-8c21-0d4e7b9a1f52' })
  id: string;

  @ApiProperty({ example: 'ada@example.com' })
  email: string;

  @ApiProperty({ example: 'Ada' })
  name: string;

  @ApiProperty({ example: 'Lovelace' })
  last_name: string;
}
