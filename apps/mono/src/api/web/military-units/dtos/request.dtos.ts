import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';

export class GetMilitaryUnitsRequestDto extends PaginationSortingQuery {
  @ApiPropertyOptional({
    description: 'The search query',
    example: '145-та Бригада',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
