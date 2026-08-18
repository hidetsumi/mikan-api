import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  last_name: string;
}

export class RegisterResponseDto {
  id: string;
  email: string;
  name: string;
  last_name: string;
}
