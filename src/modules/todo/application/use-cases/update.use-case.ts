import { Injectable, NotFoundException } from '@nestjs/common';
import { TodoRepository } from '../../domain/repository/todo.repository';
import { UpdateTodoInput } from '../../domain/repository/todo.repository.type';
import { COMPLETED_STATUSES } from '../../domain/entities/todo.entity.types';

type UpdateInput = UpdateTodoInput & {
  owner_user_id: string;
};

@Injectable()
export class UpdateUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute({ owner_user_id, ...input }: UpdateInput) {
    const todo = await this.todoRepository.findById(input.id, owner_user_id);

    if (!todo) throw new NotFoundException('Todo not found');

    if (input.status === undefined) return await this.todoRepository.update(input);

    return await this.todoRepository.update({
      ...input,
      completed_at: COMPLETED_STATUSES.includes(input.status)
        ? (todo.completed_at ?? new Date())
        : null,
    });
  }
}
