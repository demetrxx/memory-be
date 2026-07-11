import { AdminRole } from '@app/core';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ProtectedAdmin } from '@/modules/auth';
import { LogsAdminService } from '@/modules/logs';

import {
  ActivityLogDto,
  ActivityLogListQuery,
  SystemLogDto,
  SystemLogListQuery,
} from './dtos';
import { GetActivityLogsOpenApi, GetSystemLogsOpenApi } from './logs.openapi';

@ApiTags('Admin / Logs')
@ProtectedAdmin([AdminRole.Owner, AdminRole.Support, AdminRole.Developer])
@Controller()
export class LogsController {
  constructor(private readonly logsService: LogsAdminService) {}

  @GetSystemLogsOpenApi()
  @Get('/system')
  async getSystemLogs(@Query() query: SystemLogListQuery) {
    const result = await this.logsService.getSystemLogs(query);

    return {
      ...result,
      data: result.data.map((log) => SystemLogDto.mapFromEntity(log)),
    };
  }

  @GetActivityLogsOpenApi()
  @Get('/activity')
  async getActivityLogs(@Query() query: ActivityLogListQuery) {
    const result = await this.logsService.getActivityLogs(query);

    return {
      ...result,
      data: result.data.map((log) => ActivityLogDto.mapFromEntity(log)),
    };
  }
}
