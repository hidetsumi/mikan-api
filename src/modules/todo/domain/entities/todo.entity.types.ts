export const TodoStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  CANCELLED: 'CANCELLED',
} as const;

export type TodoProps = {
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
};

export type TodoStatus = (typeof TodoStatus)[keyof typeof TodoStatus];
