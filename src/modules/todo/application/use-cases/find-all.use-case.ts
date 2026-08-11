import { Injectable } from '@nestjs/common';
import { TodoRepository } from '../../domain/repository/todo.repository';
import { PaginationParams } from 'src/shared/domain/pagination';

type FindAllInput = PaginationParams & {
  owner_user_id: string;
};

@Injectable()
export class FindAllUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute({ owner_user_id, ...params }: FindAllInput) {
    return await this.todoRepository.findAllByOwnerUserId(owner_user_id, params);
  }
}
