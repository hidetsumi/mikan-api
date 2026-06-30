import { PaginationParams } from 'src/shared/domain/pagination';
import { TodoStatus } from '../../domain/entities/todo.entity.types';

export type FindTodoInput = PaginationParams & {
  owner_user_id?: string;
  status?: TodoStatus;
};
