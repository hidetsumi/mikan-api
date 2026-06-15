import { TodoStatus } from '../entities/todo.entity.types';

export type CreateTodoInput = {
  title: string;
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
  description?: string;
  status?: TodoStatus;
  assigned_user_id?: string;
  priority?: number;
  due_at?: Date;
  id: string;
};
