import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
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
  async findAll(@Query() findTodoDto: FindTodoDto, @CurrentUser() user: JwtUserPayload) {
    return this.findAllUseCase.execute({
      ...findTodoDto,
      owner_user_id: user.user_id,
    });
  }

  @Post()
  async create(@Body() createTodoDto: CreateTodoDto, @CurrentUser() user: JwtUserPayload) {
    return this.createUseCase.execute({
      ...createTodoDto,
      owner_user_id: user.user_id,
    });
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
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
  async findById(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    // Let the use-case's NotFoundException propagate as a real 404
    // instead of masking every error as a 400.
    return this.findByIdUseCase.execute(id, user.user_id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: JwtUserPayload) {
    return this.deleteUseCase.execute(id, user.user_id);
  }
}
