import { AdminRole } from '@app/core';
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ProtectedAdmin } from '@/modules/auth';
import { UserAdminService } from '@/modules/user';

import {
  UpdateUserRequestDto,
  UserDetailsDto,
  UserDto,
  UsersListQuery,
} from './dtos';
import {
  GetUserOpenApi,
  GetUsersOpenApi,
  UpdateUserOpenApi,
} from './users.openapi';

@ApiTags('Admin / Users')
@ProtectedAdmin([AdminRole.Owner, AdminRole.Support, AdminRole.Developer])
@Controller()
export class UsersController {
  constructor(private readonly userService: UserAdminService) {}

  @GetUsersOpenApi
  @Get()
  async getAll(@Query() query: UsersListQuery) {
    const users = await this.userService.getMany(query);

    return {
      total: users.total,
      skip: users.skip,
      take: users.take,
      data: users.data.map((user) => UserDto.mapFromEntity(user)),
    };
  }

  @GetUserOpenApi
  @Get(':userId')
  async getOne(@Param('userId') userId: string) {
    const user = await this.userService.getOne(userId);
    return UserDetailsDto.mapFromEntity(user);
  }

  @UpdateUserOpenApi
  @Patch(':userId')
  async update(
    @Param('userId') userId: string,
    @Body() body: UpdateUserRequestDto,
  ) {
    await this.userService.update(userId, body);
    return { success: true };
  }
}
