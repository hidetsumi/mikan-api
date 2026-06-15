import { Injectable } from '@nestjs/common';
import { TodoRepository } from '../../domain/repository/todo.repository';
import { PaginationParams } from 'src/shared/domain/pagination';

@Injectable()
export class FindAllUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}

  async execute(params: PaginationParams) {
    return await this.todoRepository.findAll(params);
  }
}
