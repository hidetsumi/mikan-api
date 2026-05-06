import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserService } from '../../application/create-user.service';
import { CreateUserDto, CreateUserResponseDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private createUsersService: CreateUserService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    const user = await this.createUsersService.execute(createUserDto);

    return {
      email: user.email,
      lastName: user.lastName,
      name: user.name,
      id: user.id,
    };
  }
}
