import { AdminRole } from '@app/core';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { PaginationSortingQuery } from '@/common/utils';

export class AdminListQuery extends PaginationSortingQuery {
  @ApiPropertyOptional({
    description: 'Search by name or email',
    example: 'John',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class UpdateAdminRequestDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  lastName?: string;
}

export class InviteAdminRequestDto {
  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsEnum(AdminRole)
  role: AdminRole;

  @ApiProperty()
  @IsString()
  password: string;

  @ApiProperty()
  @IsString()
  fullName: string;
}
