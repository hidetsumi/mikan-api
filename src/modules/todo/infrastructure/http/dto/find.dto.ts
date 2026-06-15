import { TodoStatus } from '@prisma/client';
import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { PaginationDto } from 'src/shared/infrastructure/http/pagination.dto';

export class FindTodoDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  owner_user_id?: string;

  @IsOptional()
  @IsEnum(TodoStatus)
  status?: TodoStatus;
}
