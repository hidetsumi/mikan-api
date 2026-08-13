import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
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

  @ApiPropertyOptional({
    enum: TodoStatus,
    example: TodoStatus.PENDING,
    default: TodoStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;

  @ApiPropertyOptional({
    example: '3f1c5a2e-9b7d-4f6a-8c21-0d4e7b9a1f52',
    description: 'User the todo is assigned to. Defaults to nobody.',
  })
  @IsOptional()
  @IsUUID()
  assigned_user_id?: string;

  @ApiPropertyOptional({ example: 0, default: 0, description: 'Higher means more important.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ example: '2026-09-01T10:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  due_at?: Date;
}
