import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { PaginationParams } from 'src/shared/domain/pagination';

export class PaginationDto implements PaginationParams {
  @ApiPropertyOptional({ example: 0, description: 'Rows to skip.' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset: number = 0;

  @ApiPropertyOptional({ example: 20, description: 'Rows to return.' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;
}
