import { TodoStatus } from '@prisma/client';
import { IsOptional, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/shared/infrastructure/http/pagination.dto';

export class FindTodoDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;
}
