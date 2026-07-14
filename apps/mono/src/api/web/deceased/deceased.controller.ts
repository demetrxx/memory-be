import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { ProtectedWeb, UserWeb } from '@/modules/auth';
import { DeceasedService } from '@/modules/deceased';

import {
  CreateDeceasedRequestDto,
  DeceasedDetailsDto,
  DeceasedDto,
  GetDeceasedRequestDto,
} from './dtos';

@Controller()
export class DeceasedController {
  constructor(private readonly deceasedService: DeceasedService) {}

  @ProtectedWeb(true)
  @Get()
  async getMany(@Query() query: GetDeceasedRequestDto) {
    const { data, total, skip, take } =
      await this.deceasedService.getMany(query);

    return {
      data: data.map(DeceasedDto.mapFromEntity),
      total,
      skip,
      take,
    };
  }

  @ProtectedWeb(true)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    const deceased = await this.deceasedService.getOne(id);

    return DeceasedDetailsDto.mapFromEntity(deceased);
  }

  @ProtectedWeb()
  @Post()
  async create(
    @Body() body: CreateDeceasedRequestDto,
    @UserWeb() user: UserWeb,
  ) {
    const deceased = await this.deceasedService.create(user, body);

    return DeceasedDto.mapFromEntity(deceased);
  }
}
