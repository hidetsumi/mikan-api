import { PaginationResult } from 'src/shared/domain/pagination';
import { Todo } from '../entities/todo.entity';
import { CreateTodoInput, FindTodoParams, UpdateTodoInput } from './todo.repository.type';

export abstract class TodoRepository {
  abstract findById(id: string, owner_user_id: string): Promise<Todo | null>;
  abstract findAllByOwnerUserId(
    owner_user_id: string,
    params: FindTodoParams,
  ): Promise<PaginationResult<Todo[]>>;
  abstract findAllByAssignedUserId(
    assigned_user_id: string,
    params: FindTodoParams,
  ): Promise<PaginationResult<Todo[]>>;
  abstract create(todo: CreateTodoInput): Promise<Todo>;
  abstract update(todo: UpdateTodoInput): Promise<Todo>;
  abstract delete(id: string): Promise<void>;
}
