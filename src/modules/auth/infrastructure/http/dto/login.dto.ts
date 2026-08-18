import { IsEmail, IsString } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class LoginResponseDto {
  id: string;
  email: string;
  name: string;
  last_name: string;
}
