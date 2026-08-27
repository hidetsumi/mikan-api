import { Injectable } from '@nestjs/common';
import { TodoRepository } from '../../domain/repository/todo.repository';
import { FindTodoInput } from '../types/find.type';

@Injectable()
export class FindAllUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute({ owner_user_id, ...params }: FindTodoInput) {
    return await this.todoRepository.findAllByOwnerUserId(owner_user_id, params);
  }
}
