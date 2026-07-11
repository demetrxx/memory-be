import { Controller, Get, Patch, Query } from '@nestjs/common';

import { PaginationSortingQuery } from '@/common/utils';
import { ProtectedWeb, UserWeb } from '@/modules/auth';
import { NotificationService } from '@/modules/notification';

import { NotificationResponseDto } from './dtos';

@ProtectedWeb()
@Controller()
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getMany(
    @UserWeb() user: UserWeb,
    @Query() query: PaginationSortingQuery,
  ) {
    const { data, total, skip, take } = await this.notificationService.getMany(
      user.id,
      query,
    );

    return {
      data: data.map(NotificationResponseDto.mapFromEntity),
      total,
      skip,
      take,
    };
  }

  @Patch('read')
  async read(@UserWeb() user: UserWeb) {
    await this.notificationService.readAll(user.id);
    return { success: true };
  }
}
