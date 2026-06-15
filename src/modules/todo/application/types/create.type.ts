import { TodoStatus } from '../../domain/entities/todo.entity.types';

export type CreateTodoInput = {
  title: string;
  description?: string;
  owner_user_id?: string;
  status?: TodoStatus;
  assigned_user_id?: string;
  priority?: number;
  owner_guest_id?: string;
  due_at?: Date;
};
