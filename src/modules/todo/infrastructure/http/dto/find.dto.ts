import { ApiPropertyOptional } from '@nestjs/swagger';
import { TodoStatus } from '@prisma/client';
import { IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/shared/infrastructure/http/pagination.dto';

export class FindTodoDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: TodoStatus,
    description: 'Filter by status. Accepted and validated, but not applied to the query yet.',
  })
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;
}
