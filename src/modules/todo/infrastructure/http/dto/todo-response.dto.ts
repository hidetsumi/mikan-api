import { ApiProperty } from '@nestjs/swagger';
import { TodoStatus } from 'src/modules/todo/domain/entities/todo.entity.types';

export class TodoResponseDto {
  @ApiProperty({ format: 'uuid', example: '9c4f2b81-3d5e-4a07-b6c9-1e8f0a2d7b34' })
  id: string;

  @ApiProperty({ example: 'Buy milk' })
  title: string;

  @ApiProperty({ example: 'Oat, not cow.' })
  description: string | null;

  @ApiProperty({ enum: TodoStatus, example: TodoStatus.PENDING })
  status: TodoStatus;

  @ApiProperty({ example: 0 })
  priority: number;

  @ApiProperty({ format: 'uuid', example: '3f1c5a2e-9b7d-4f6a-8c21-0d4e7b9a1f52' })
  owner_user_id: string | null;

  @ApiProperty({ format: 'uuid', description: 'Reserved for rooms (v0.4.0).' })
  room_id: string | null;

  @ApiProperty({ format: 'uuid', description: 'Reserved for rooms (v0.4.0).' })
  owner_guest_id: string | null;

  @ApiProperty({ format: 'uuid', example: '3f1c5a2e-9b7d-4f6a-8c21-0d4e7b9a1f52' })
  assigned_user_id: string | null;

  @ApiProperty({ example: '2026-09-01T10:00:00.000Z' })
  due_at: Date | null;

  @ApiProperty({ example: '2026-08-30T18:22:41.000Z' })
  completed_at: Date | null;

  @ApiProperty({ example: '2026-08-28T09:15:00.000Z' })
  created_at: Date;

  @ApiProperty({ example: '2026-08-30T18:22:41.000Z' })
  updated_at: Date;
}

export class PaginatedTodoResponseDto {
  @ApiProperty({ type: [TodoResponseDto] })
  data: TodoResponseDto[];

  @ApiProperty({ example: 42, description: 'Total rows matching the query, ignoring pagination.' })
  total: number;
}
