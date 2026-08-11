import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TodoStatus } from 'src/modules/todo/domain/entities/todo.entity.types';

export class UpdateTodoDto {
  @ApiPropertyOptional({ example: 'Buy oat milk' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'Oat, not cow.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TodoStatus })
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsString()
  assigned_user_id?: string;

  @ApiPropertyOptional({ minimum: 0, description: 'Higher means more important.' })
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
