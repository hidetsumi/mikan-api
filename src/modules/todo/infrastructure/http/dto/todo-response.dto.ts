import { TodoStatus } from 'src/modules/todo/domain/entities/todo.entity.types';

export class TodoResponseDto {
  id: string;
  title: string;
  description: string | null;
  status: TodoStatus;
  priority: number;
  owner_user_id: string | null;
  room_id: string | null;
  owner_guest_id: string | null;
  assigned_user_id: string | null;
  due_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export class PaginatedTodoResponseDto {
  data: TodoResponseDto[];
  total: number;
}
