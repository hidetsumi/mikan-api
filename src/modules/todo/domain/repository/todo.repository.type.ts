import { PaginationParams } from 'src/shared/domain/pagination';
import { TodoStatus } from '../entities/todo.entity.types';

export type FindTodoParams = PaginationParams & {
  status?: TodoStatus;
};

export type CreateTodoInput = {
  title: string;
  completed_at?: Date | null;
  description?: string;
  owner_user_id?: string;
  status?: TodoStatus;
  assigned_user_id?: string;
  priority: number;
  owner_guest_id?: string;
  due_at?: Date;
};

export type UpdateTodoInput = {
  title?: string;
  completed_at?: Date | null;
  description?: string;
  status?: TodoStatus;
  assigned_user_id?: string;
  priority?: number;
  due_at?: Date;
  id: string;
};
