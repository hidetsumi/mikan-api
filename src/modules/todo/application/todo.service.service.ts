import { Injectable } from '@nestjs/common';
import { CreateTodoInput } from './types/create.type';
import { CreateUseCase } from './use-cases/create.use-case';
import { FindAllUseCase } from './use-cases/find-all.use-case';
import { FindByIdUseCase } from './use-cases/find-by-id.use-case';
import { UpdateTodoInput } from './types/update.type';
import { UpdateUseCase } from './use-cases/update.use-case';
import { DeleteUseCase } from './use-cases/delete.use-case';
import { FindTodoInput } from './types/find.type';

@Injectable()
export class TodoService {
  constructor(
    private readonly createUseCase: CreateUseCase,
    private readonly findAllUseCase: FindAllUseCase,
    private readonly findByIdUseCase: FindByIdUseCase,
    private readonly updateUseCase: UpdateUseCase,
    private readonly deleteUseCase: DeleteUseCase,
  ) {}

  async findById(id: string) {
    return this.findByIdUseCase.execute(id);
  }

  async create(createTodoInput: CreateTodoInput) {
    return this.createUseCase.execute(createTodoInput);
  }

  async findAll(findTodoInput: FindTodoInput) {
    return this.findAllUseCase.execute(findTodoInput);
  }

  async update(updateTodoInput: UpdateTodoInput) {
    return this.updateUseCase.execute(updateTodoInput);
  }

  async delete(id: string) {
    return this.deleteUseCase.execute(id);
  }
}
