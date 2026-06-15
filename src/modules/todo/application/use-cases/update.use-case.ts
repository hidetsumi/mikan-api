import { BadRequestException, Injectable } from '@nestjs/common';
import { TodoRepository } from '../../domain/repository/todo.repository';
import { UpdateTodoInput } from '../types/update.type';

@Injectable()
export class UpdateUseCase {
  constructor(private readonly todoRepository: TodoRepository) {}
  async execute(input: UpdateTodoInput) {
    const todo = await this.todoRepository.findById(input.id);

    if (!todo) throw new BadRequestException('Todo not found');

    return await this.todoRepository.update(input);
  }
}
