import { UserStatus } from '@app/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';

export class UsersListQuery extends PaginationSortingQuery {
  @ApiPropertyOptional({
    description: 'Search by username',
    example: 'username',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class UpdateUserRequestDto {
  @ApiPropertyOptional({
    description: 'User status',
    example: UserStatus.Active,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
