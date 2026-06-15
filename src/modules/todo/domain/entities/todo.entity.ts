import { TodoProps, TodoStatus } from './todo.entity.types';

export class Todo {
  public readonly id: string;
  public readonly title: string;
  public readonly description: string | null;
  public readonly status: TodoStatus;
  public readonly priority: number;
  public readonly owner_user_id: string | null;
  public readonly room_id: string | null;
  public readonly owner_guest_id: string | null;
  public readonly assigned_user_id: string | null;
  public readonly due_at: Date | null;
  public readonly completed_at: Date | null;
  public readonly created_at: Date;
  public readonly updated_at: Date;

  constructor(props: TodoProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.status = props.status;
    this.priority = props.priority;
    this.owner_user_id = props.owner_user_id;
    this.room_id = props.room_id;
    this.owner_guest_id = props.owner_guest_id;
    this.assigned_user_id = props.assigned_user_id;
    this.due_at = props.due_at;
    this.completed_at = props.completed_at;
    this.created_at = props.created_at;
    this.updated_at = props.updated_at;
  }
}
