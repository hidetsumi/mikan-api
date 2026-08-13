import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { TodoStatus } from 'src/modules/todo/domain/entities/todo.entity.types';
import { PaginationDto } from 'src/shared/infrastructure/http/pagination.dto';

export class FindTodoDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: TodoStatus,
    example: TodoStatus.PENDING,
    description: 'Filter by status. Accepted and validated, but not applied to the query yet.',
  })
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;
}
