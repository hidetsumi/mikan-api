import { PrismaService } from 'src/shared/infrastructure/prisma/prisma.service';
import { TodoRepository } from '../../domain/repository/todo.repository';
import { Todo } from '../../domain/entities/todo.entity';
import { CreateTodoInput, UpdateTodoInput } from '../../domain/repository/todo.repository.type';
import { PaginationParams, PaginationResult } from 'src/shared/domain/pagination';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaTodoRepository implements TodoRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<Todo | null> {
    const existingTodo = await this.prismaService.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) return null;

    return new Todo(existingTodo);
  }

  async create(todo: CreateTodoInput): Promise<Todo> {
    const createdTodo = await this.prismaService.todo.create({
      data: {
        title: todo.title,
        description: todo.description,
        status: todo.status,
        priority: todo.priority,
        owner_user_id: todo.owner_user_id,
        owner_guest_id: todo.owner_guest_id,
        assigned_user_id: todo.assigned_user_id,
        due_at: todo.due_at,
      },
    });

    return new Todo(createdTodo);
  }

  async findAll({ limit, offset }: PaginationParams): Promise<PaginationResult<Todo[]>> {
    const [todos, total] = await this.prismaService.$transaction([
      this.prismaService.todo.findMany({
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prismaService.todo.count({
        where: {},
      }),
    ]);

    return {
      data: todos.map((todo) => new Todo(todo)),
      total,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.todo.delete({ where: { id } });
  }

  async findAllByAssignedUserId(
    assigned_user_id: string,
    { limit, offset }: PaginationParams,
  ): Promise<PaginationResult<Todo[]>> {
    const [todos, total] = await this.prismaService.$transaction([
      this.prismaService.todo.findMany({
        where: {
          assigned_user_id,
        },
        skip: offset,
        take: limit,
      }),
      this.prismaService.todo.count({
        where: {
          assigned_user_id,
        },
      }),
    ]);

    return {
      data: todos.map((todo) => new Todo(todo)),
      total,
    };
  }

  async findAllByOwnerUserId(
    owner_user_id: string,
    { limit, offset }: PaginationParams,
  ): Promise<PaginationResult<Todo[]>> {
    const [todos, total] = await this.prismaService.$transaction([
      this.prismaService.todo.findMany({
        where: {
          owner_user_id,
        },
        skip: offset,
        take: limit,
      }),
      this.prismaService.todo.count({
        where: {
          owner_user_id,
        },
      }),
    ]);

    return {
      data: todos.map((todo) => new Todo(todo)),
      total,
    };
  }

  async update({ id, ...todo }: UpdateTodoInput): Promise<Todo> {
    const updatedTodo = await this.prismaService.todo.update({
      where: {
        id,
      },
      data: todo,
    });

    return new Todo(updatedTodo);
  }
}
