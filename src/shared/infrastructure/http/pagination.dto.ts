import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { PaginationParams } from 'src/shared/domain/pagination';

export class PaginationDto implements PaginationParams {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;
}
