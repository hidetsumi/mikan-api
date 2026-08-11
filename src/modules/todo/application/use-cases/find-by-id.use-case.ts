import { Injectable, NotFoundException } from '@nestjs/common';
import { TodoRepository } from '../../domain/repository/todo.repository';

@Injectable()
export class FindByIdUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(id: string, owner_user_id: string) {
    const todo = await this.todoRepository.findById(id, owner_user_id);

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return todo;
  }
}
