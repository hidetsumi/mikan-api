import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({ example: 'ada@example.com', description: 'Unique email address.' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'correct-horse-battery',
    minLength: 8,
    description: 'Plain password, hashed before it is stored.',
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Ada', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Lovelace', minLength: 2 })
  @IsString()
  @MinLength(2)
  last_name: string;
}

export class RegisterResponseDto {
  @ApiProperty({ format: 'uuid', example: '3f1c5a2e-9b7d-4f6a-8c21-0d4e7b9a1f52' })
  id: string;

  @ApiProperty({ example: 'ada@example.com' })
  email: string;

  @ApiProperty({ example: 'Ada' })
  name: string;

  @ApiProperty({ example: 'Lovelace' })
  last_name: string;
}
