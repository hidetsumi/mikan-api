import { IsOptional, IsEnum } from 'class-validator';
import { TodoStatus } from 'src/modules/todo/domain/entities/todo.entity.types';
import { PaginationDto } from 'src/shared/infrastructure/http/pagination.dto';

export class FindTodoRequestDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;
}
