import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateUseCase } from '../../application/use-cases/create.use-case';
import { FindAllUseCase } from '../../application/use-cases/find-all.use-case';
import { FindByIdUseCase } from '../../application/use-cases/find-by-id.use-case';
import { UpdateUseCase } from '../../application/use-cases/update.use-case';
import { DeleteUseCase } from '../../application/use-cases/delete.use-case';
import { CreateTodoDto } from './dto/create.dto';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/http/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/infrastructure/http/decorator/current-user.decorator';
import type { JwtUserPayload } from 'src/modules/auth/domain/services/token.services';
import { UpdateTodoDto } from './dto/update.dto';
import { FindTodoDto } from './dto/find.dto';
import { PaginatedTodoResponseDto, TodoResponseDto } from './dto/todo-response.dto';

@ApiTags('todo')
@ApiCookieAuth('access_token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access_token cookie.' })
@Controller('todo')
@UseGuards(JwtAuthGuard)
export class TodoController {
  constructor(
    private readonly createUseCase: CreateUseCase,
    private readonly findAllUseCase: FindAllUseCase,
    private readonly findByIdUseCase: FindByIdUseCase,
    private readonly updateUseCase: UpdateUseCase,
    private readonly deleteUseCase: DeleteUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: "List the authenticated user's todos",
    description: 'Returns only todos owned by the caller, newest first.',
  })
  @ApiOkResponse({ type: PaginatedTodoResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  async findAll(@Query() findTodoDto: FindTodoDto, @CurrentUser() user: JwtUserPayload) {
    return this.findAllUseCase.execute({
      ...findTodoDto,
      owner_user_id: user.user_id,
    });
  }

  @Post()
  @ApiOperation({
    summary: 'Create a todo',
    description: 'The todo is owned by the authenticated user.',
  })
  @ApiCreatedResponse({ type: TodoResponseDto })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  async create(@Body() createTodoDto: CreateTodoDto, @CurrentUser() user: JwtUserPayload) {
    return this.createUseCase.execute({
      ...createTodoDto,
      owner_user_id: user.user_id,
    });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a todo the caller owns' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: TodoResponseDto })
  @ApiNotFoundResponse({ description: 'No such todo, or it belongs to another user.' })
  @ApiBadRequestResponse({ description: 'Validation failed, or the id is not a valid UUID.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: JwtUserPayload,
  ) {
    return this.updateUseCase.execute({
      id,
      ...updateTodoDto,
      owner_user_id: user.user_id,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a todo the caller owns' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: TodoResponseDto })
  @ApiNotFoundResponse({ description: 'No such todo, or it belongs to another user.' })
  @ApiBadRequestResponse({ description: 'The id is not a valid UUID.' })
  async findById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUserPayload) {
    // Let the use-case's NotFoundException propagate as a real 404
    // instead of masking every error as a 400.
    return this.findByIdUseCase.execute(id, user.user_id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a todo the caller owns' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Deleted. The response body is empty.' })
  @ApiNotFoundResponse({ description: 'No such todo, or it belongs to another user.' })
  @ApiBadRequestResponse({ description: 'The id is not a valid UUID.' })
  async delete(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtUserPayload) {
    return this.deleteUseCase.execute(id, user.user_id);
  }
}
