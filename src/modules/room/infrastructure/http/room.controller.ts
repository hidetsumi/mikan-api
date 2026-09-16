import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/http/guards/jwt-auth.guard';
import { CreateRoomRequestDto } from './dto/create.dto';
import { CurrentUser } from 'src/modules/auth/infrastructure/http/decorator/current-user.decorator';
import type { JwtUserPayload } from 'src/modules/auth/domain/services/token.services';
import { CreateUseCase } from '../../application/use-cases/create.use-case';
import { RoomResponseDto } from './dto/response.dto';

@ApiTags('room')
@ApiCookieAuth('access_token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access_token cookie.' })
@Controller('room')
@UseGuards(JwtAuthGuard)
export class RoomController {
  constructor(private readonly createUseCase: CreateUseCase) {}

  @Post()
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  async create(
    @Body() createRoomDto: CreateRoomRequestDto,
    @CurrentUser() user: JwtUserPayload,
  ): Promise<RoomResponseDto> {
    return this.createUseCase.execute({ ...createRoomDto, owner_user_id: user.user_id });
  }
}
