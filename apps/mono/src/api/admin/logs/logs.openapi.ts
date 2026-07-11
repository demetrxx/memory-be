import { applyDecorators } from '@nestjs/common';

import { ApiPaginatedResponse } from '@/common/utils';

import { ActivityLogDto, SystemLogDto } from './dtos';

export const GetSystemLogsOpenApi = () =>
  applyDecorators(ApiPaginatedResponse(SystemLogDto));

export const GetActivityLogsOpenApi = () =>
  applyDecorators(ApiPaginatedResponse(ActivityLogDto));
