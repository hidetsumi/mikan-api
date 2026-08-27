import { BadRequestException, Injectable } from '@nestjs/common';
import { TodoRepository } from '../../domain/repository/todo.repository';
import { CreateTodoInput } from '../types/create.type';
import { Todo } from '../../domain/entities/todo.entity';
import { COMPLETED_STATUSES } from '../../domain/entities/todo.entity.types';

@Injectable()
export class CreateUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(input: CreateTodoInput): Promise<Todo> {
    if (!input.title.trim()) throw new BadRequestException('Title is required');
    if (!input.owner_user_id && !input.owner_guest_id)
      throw new BadRequestException('A creator is required');
    if (input.due_at && input.due_at < new Date())
      throw new BadRequestException('due_at cannot be in the past');

    return this.todoRepository.create({
      ...input,
      priority: input.priority ?? 0,
      completed_at: input.status && COMPLETED_STATUSES.includes(input.status) ? new Date() : null,
    });
  }
}
