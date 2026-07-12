import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';

export class GetSettlementsRequestDto extends PaginationSortingQuery {
  @ApiPropertyOptional({
    description: 'The search query',
    example: 'Kharkiv',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
