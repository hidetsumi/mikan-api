import { FindTodoParams } from '../../domain/repository/todo.repository.type';

export type FindTodoInput = FindTodoParams & {
  owner_user_id: string;
};
