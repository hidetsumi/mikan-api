import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
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
  lastName: string;
}

export class CreateUserResponseDto {
  email: string;
  name: string;
  lastName: string;
  id: string;
}
