import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from '../../application/todo.service.service';
import { CreateTodoDto } from './dto/create.dto';
import { JwtAuthGuard } from 'src/modules/auth/infrastructure/http/guards/jwt-auth.guard';
import { CurrentUser } from 'src/modules/auth/infrastructure/http/decorator/current-user.decorator';
import type { JwtUserPayload } from 'src/modules/auth/domain/services/token.services';
import { UpdateTodoDto } from './dto/update.dto';
import { FindTodoDto } from './dto/find.dto';

@Controller('todo')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async findAll(@Body() findTodoDto: FindTodoDto) {
    return this.todoService.findAll(findTodoDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createTodoDto: CreateTodoDto, @CurrentUser() user: JwtUserPayload) {
    const createdTodo = this.todoService.create({
      ...createTodoDto,
      owner_user_id: user.user_id,
    });

    return createdTodo;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    return this.todoService.update({ id, ...updateTodoDto });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    try {
      return await this.todoService.findById(id);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.todoService.delete(id);
  }
}
