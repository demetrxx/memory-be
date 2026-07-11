import { AdminRole, PlanType } from '@app/core';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ProtectedAdmin } from '@/modules/auth';
import { PlanAdminService } from '@/modules/payment';

import {
  CreatePlanRequestDto,
  PlanDto,
  PlansListQuery,
  UpdatePlanRequestDto,
} from './dtos';
import {
  CreatePlanOpenApi,
  DeletePlanOpenApi,
  GetPlansOpenApi,
  UpdatePlanOpenApi,
} from './plans.openapi';

@ApiTags('Admin / Plans')
@ProtectedAdmin([AdminRole.Owner, AdminRole.Support, AdminRole.Developer])
@Controller()
export class PlansController {
  constructor(private readonly planService: PlanAdminService) {}

  @GetPlansOpenApi
  @Get()
  async getAll(@Query() query: PlansListQuery) {
    const plans = await this.planService.getMany(query);

    return {
      total: plans.total,
      skip: plans.skip,
      take: plans.take,
      data: plans.data.map((plan) => PlanDto.mapFromEntity(plan)),
    };
  }

  @CreatePlanOpenApi
  @Post()
  async create(@Body() body: CreatePlanRequestDto) {
    if (
      body.type === PlanType.Subscription &&
      (!body.period || !body.periodCount)
    ) {
      throw new BadRequestException(
        'Period and period count are required for subscription plans',
      );
    }

    await this.planService.create(body);
    return { success: true };
  }

  @UpdatePlanOpenApi
  @Patch(':planId')
  async update(
    @Param('planId') planId: string,
    @Body() body: UpdatePlanRequestDto,
  ) {
    await this.planService.update(planId, body);
    return { success: true };
  }

  @DeletePlanOpenApi
  @Delete(':planId')
  async delete(@Param('planId') planId: string) {
    await this.planService.delete(planId);
    return { success: true };
  }
}
