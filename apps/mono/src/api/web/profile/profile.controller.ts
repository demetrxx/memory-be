import { Body, Controller, Get, Header, Patch } from '@nestjs/common';

import { ProtectedWeb, UserWeb } from '@/modules/auth';
import { UserWebService } from '@/modules/user';

import {
  ProfileResponseDto,
  UpdateProfileRequestDto,
  UpdateSubscriptionRequestDto,
} from './dtos';

@ProtectedWeb()
@Controller()
export class ProfileController {
  constructor(private readonly service: UserWebService) {}

  @Get()
  @Header('Cache-Control', 'no-store')
  async get(@UserWeb() user: UserWeb): Promise<ProfileResponseDto> {
    const profile = await this.service.getOne(user.id);
    return ProfileResponseDto.mapFromEntity(profile);
  }

  @Patch()
  async update(
    @UserWeb() user: UserWeb,
    @Body() body: UpdateProfileRequestDto,
  ) {
    await this.service.updateOne(user.id, body);
    return { success: true };
  }

  @Patch('subscription')
  async updateSubscription(
    @UserWeb() user: UserWeb,
    @Body() body: UpdateSubscriptionRequestDto,
  ) {
    await this.service.updateSubscription(user.id, body);
    return { success: true };
  }
}
