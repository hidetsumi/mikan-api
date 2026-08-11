import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { TodoStatus } from 'src/modules/todo/domain/entities/todo.entity.types';

export class CreateTodoDto {
  @ApiProperty({ example: 'Buy milk' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Oat, not cow.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TodoStatus, default: TodoStatus.PENDING })
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'User the todo is assigned to. Defaults to nobody.',
  })
  @IsOptional()
  @IsString()
  assigned_user_id?: string;

  @ApiPropertyOptional({ minimum: 0, default: 0, description: 'Higher means more important.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ format: 'date-time', example: '2026-09-01T10:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  due_at?: Date;
}
