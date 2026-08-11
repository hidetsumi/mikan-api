import { ApiProperty } from '@nestjs/swagger';
import { TodoStatus } from 'src/modules/todo/domain/entities/todo.entity.types';

export class TodoResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Buy milk' })
  title: string;

  @ApiProperty({ nullable: true, example: 'Oat, not cow.' })
  description: string | null;

  @ApiProperty({ enum: TodoStatus })
  status: TodoStatus;

  @ApiProperty({ example: 0 })
  priority: number;

  @ApiProperty({ format: 'uuid', nullable: true })
  owner_user_id: string | null;

  @ApiProperty({ format: 'uuid', nullable: true, description: 'Reserved for rooms (v0.4.0).' })
  room_id: string | null;

  @ApiProperty({ format: 'uuid', nullable: true, description: 'Reserved for rooms (v0.4.0).' })
  owner_guest_id: string | null;

  @ApiProperty({ format: 'uuid', nullable: true })
  assigned_user_id: string | null;

  @ApiProperty({ format: 'date-time', nullable: true })
  due_at: Date | null;

  @ApiProperty({ format: 'date-time', nullable: true })
  completed_at: Date | null;

  @ApiProperty({ format: 'date-time' })
  created_at: Date;

  @ApiProperty({ format: 'date-time' })
  updated_at: Date;
}

export class PaginatedTodoResponseDto {
  @ApiProperty({ type: [TodoResponseDto] })
  data: TodoResponseDto[];

  @ApiProperty({ example: 42, description: 'Total rows matching the query, ignoring pagination.' })
  total: number;
}
