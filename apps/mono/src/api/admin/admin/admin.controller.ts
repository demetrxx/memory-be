import { AdminRole } from '@app/core';
import { Body, Controller, Get, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminService } from '@/modules/admin';
import { Admin, ProtectedAdmin } from '@/modules/auth';

import {
  GetAdminOpenApi,
  GetAdminsOpenApi,
  InviteAdminOpenApi,
  UpdateAdminOpenApi,
} from './admin.openapi';
import {
  AdminDto,
  AdminListQuery,
  InviteAdminRequestDto,
  UpdateAdminRequestDto,
} from './dtos';

@ApiTags('App / Admin')
@Controller()
@ProtectedAdmin([AdminRole.Owner, AdminRole.Support, AdminRole.Developer])
export class AdminAppController {
  constructor(private readonly adminService: AdminService) {}

  @GetAdminOpenApi()
  @ProtectedAdmin([AdminRole.Owner, AdminRole.Support, AdminRole.Developer])
  @Get('me')
  async getAdmin(@Admin() admin: Admin): Promise<AdminDto> {
    return this.adminService.getOne(admin.id);
  }

  @UpdateAdminOpenApi()
  @ProtectedAdmin([AdminRole.Owner, AdminRole.Support, AdminRole.Developer])
  @Patch('me')
  async updateAdmin(
    @Admin() admin: Admin,
    @Body() body: UpdateAdminRequestDto,
  ) {
    await this.adminService.updateOne(admin.id, body);
    return { success: true };
  }

  @InviteAdminOpenApi()
  @Post('invite')
  async invite(@Admin() admin: Admin, @Body() body: InviteAdminRequestDto) {
    await this.adminService.invite({
      email: body.email,
      role: body.role,
      password: body.password,
      fullName: body.fullName,
      invitedById: admin.id,
    });

    return { success: true };
  }

  @GetAdminsOpenApi()
  @Get()
  async get(@Query() query: AdminListQuery) {
    const result = await this.adminService.getMany(query);

    return {
      ...result,
      data: result.data.map((admin) => AdminDto.mapFromEntity(admin)),
    };
  }
}
