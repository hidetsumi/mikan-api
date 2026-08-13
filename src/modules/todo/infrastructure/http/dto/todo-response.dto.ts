import { ApiProperty } from '@nestjs/swagger';
import { TodoStatus } from 'src/modules/todo/domain/entities/todo.entity.types';

export class TodoResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Buy milk' })
  title: string;

  @ApiProperty({ example: 'Oat, not cow.' })
  description: string | null;

  @ApiProperty({ enum: TodoStatus })
  status: TodoStatus;

  @ApiProperty({ example: 0 })
  priority: number;

  @ApiProperty({ format: 'uuid' })
  owner_user_id: string | null;

  @ApiProperty({ format: 'uuid', description: 'Reserved for rooms (v0.4.0).' })
  room_id: string | null;

  @ApiProperty({ format: 'uuid', description: 'Reserved for rooms (v0.4.0).' })
  owner_guest_id: string | null;

  @ApiProperty({ format: 'uuid' })
  assigned_user_id: string | null;

  due_at: Date | null;

  completed_at: Date | null;

  created_at: Date;

  updated_at: Date;
}

export class PaginatedTodoResponseDto {
  @ApiProperty({ type: [TodoResponseDto] })
  data: TodoResponseDto[];

  @ApiProperty({ example: 42, description: 'Total rows matching the query, ignoring pagination.' })
  total: number;
}
